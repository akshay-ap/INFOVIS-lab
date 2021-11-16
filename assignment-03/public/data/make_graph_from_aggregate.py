import json
import common
import argparse
import logging

import pandas as pd

from math import factorial
from pathlib import Path
from pandas.core.groupby.generic import DataFrameGroupBy

def export_graph(path: str, nodes: pd.DataFrame, edges: pd.DataFrame):
    """
    Exports a given anytree hierarchy to the given path.

    Parameters:
        path (str): filepath to save the tree at
        root (object): anytree node representing the tree

    Returns:
        Nothing
    """

    logging.info(f'saving graph as JSON to "{path}"')
    # list of node objects
    nobj = nodes.to_dict(orient='records')
    # list of edge/link objects
    eobj = edges.to_dict(orient='records')

    # write the graph to a json file
    with open(path, 'w') as file:
        json.dump({ 'nodes': nobj, 'links': eobj }, file, indent=2)

def aggregate_by_group(grouped: DataFrameGroupBy):
    """
    Create a new data frame based on the given group and add some
    aggregate values for each row.

    Parameters:
        grouped (DataFrameGroupBy): groupby object created by grouping a dataframe

    Returns:
        df (DataFrame): new dataframe made from grouped data
    """
    df = pd.DataFrame()
    # number of games counted for this group
    df['count'] = grouped.size()
    # some means for different attributes
    df['positive_ratings_mean'] = grouped['positive_ratings'].mean()
    df['negative_ratings_mean'] = grouped['negative_ratings'].mean()
    df['average_playtime_mean'] = grouped['average_playtime'].mean()
    df['median_playtime_mean'] = grouped['median_playtime'].mean()
    df['price_mean'] = grouped['price'].mean()
    df['achievements_mean'] = grouped['achievements'].mean()

    return df

def find_edges(df: pd.DataFrame, names: list, column: str):
    """
    Creates a dataframe containing edges for all combinations of 'names' that
    can be found in the dataframe in column 'column'.

    Parameters:
        df (DataFrame): pandas dataframe holding the data
        names (list): list of unique values for the column we made nodes of
        column (str): the column name of the data to structure the graph by

    Returns:
        edges (DataFrame): new dataframe containing edges
    """
    edges = pd.DataFrame(columns=['source', 'target', 'value'])
    options = int(factorial(len(names)) / (2 * factorial(len(names)-2)))

    logging.info(f'finding all edges for {options} combinations ...')

    idx = 1
    # for all combinations (e.g. of genres), count the co-occurrences
    # note that this is not a particularly fast implementation, more like brute-force
    for i, n1 in enumerate(names):
        # get all rows that match the first name
        filtered = df[(df[column].str.contains(n1))]
        # for all other names ... only need to check those next in the list, since
        # the combination (Y,X) is the same as (X,Y)
        for n2 in names[i+1:]:
            # count rows that also match the second name
            counts = filtered[filtered[column].str.contains(n2)].shape[0]
            if counts > 0:
                # add an edge if the count is larger than zero
                edges = edges.append(
                    { 'source': n1, 'target': n2, 'value': counts },
                    ignore_index=True
                )

            logging.debug(f'... {(idx / options)*100:.2f}% of edge combinations finished ({n1},{n2})')
            idx += 1

    logging.info('... finished finding edges')

    return edges

def make_graph(df: pd.DataFrame, column: str, threshold: int = 0, datapath: str = None):
    """
    Creates a graph from the given data frame, based on the given column.
    The resulting graph will be saved as a JSON file.

    Parameters:
        df (DataFrame): pandas dataframe holding the data
        column (str): the column name of the data to structure the graph by
        datapath (str): the path of the original data source
        threshold (int): the minimum number of occurrences to include a node in the graph

    Returns:
        None - if a datapath is given
        nodes, edges (tuple) - if no datapath is given, returns nodes and edges as dataframes
    """
    original_df = df.copy()
    # make all list-like columns into actual lists
    df = common.make_lists(df.copy())
    df = df.explode(column)

    # add the release year as a column
    df['year'] = [x[0] for x in df['release_date'].str.split('-')]

    # aggregate the data
    grouped = df.groupby([column])
    # our new (result) data frame
    new_df = aggregate_by_group(grouped)

    # group names (e.g. types of genres)
    names = list(new_df.index)

    # list of all release years
    year_list = sorted(df['year'].unique())
    # count years for all groups (creates a series with multi-index)
    # -> so a series object with an index describing the year
    # and an index describing the 'names (e.g. genres) and the respective count
    grouped_years = grouped['year'].value_counts()

    # create a column for each year in the list
    for year in year_list:
        new_df[year] = 0
        # for all group names (e.g. genres)
        for n in names:
            # try to access the year count for this group and year
            # will fail if the index does not exist, so we wrap it in try/except
            # and simply ignore when the year does not exists (i.e. no matching games that year)
            try:
                counts = grouped_years[n,year]
                new_df.loc[n,year] = counts
            except:
                pass

    # filter the data frame by our threshold
    if threshold > 0:
        new_df = new_df[new_df['count'] > threshold]
        if new_df.shape[0] == 0:
            logging.error(f'threshold of {threshold} is too large, no matching nodes found')
            exit(-1)

    # sort values (i.e. nodes) by the count of games in a descending manner
    new_df.sort_values(by='count', ascending=False, inplace=True)

    logging.debug(new_df)

    # all group names
    names = list(new_df.index)
    # now we find the edges
    edges = find_edges(original_df, names, column)

    logging.info(f'graph has {new_df.shape[0]} nodes and {edges.shape[0]} edges')

    # add the name of the column we aggregated on as id for each node
    new_df['id'] = list(new_df.index)

    if datapath is not None:

        stem = Path(datapath).stem
        if threshold > 0:
            outpath = f'{stem}_{column}_{threshold}_aggregate_graph.json'
        else:
            outpath = f'{stem}_{column}_aggregate_graph.json'

        export_graph(outpath, new_df, edges)
    else:
        return new_df, edges

if __name__ == '__main__':

    # define arguments for this script
    parser = argparse.ArgumentParser()
    parser.add_argument('datapath', help='path to the CSV dataset')
    parser.add_argument(
        'column',
        help='which column to aggregate on',
        choices=common.LIST_ATTRS
    )
    parser.add_argument(
        '--threshold', '-t',
        type=int,
        help='minimum occurrences to include a node, default is 0',
        metavar='[t >= 0]',
        default=0
    )
    parser.add_argument(
        '--loglevel', '-l',
        choices=['DEBUG', 'INFO', 'ERROR'],
        help='set the loggging level, default is INFO',
        default='INFO'
    )

     # parse command line arguments
    args = parser.parse_args()

    # configure logging
    common.configure_logger(args.loglevel)

    # read the data file
    try:
        df = common.read_data(args.datapath)
        logging.info(f'loaded data from "{args.datapath}"')
    except ValueError as e:
        logging.error(e)
        exit(-1)

    # make the graph (make sure threshold is a positive number)
    make_graph(df, args.column, max(0, args.threshold), args.datapath)
