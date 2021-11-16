import common
import argparse
import logging

import pandas as pd

from pathlib import Path
from anytree import Node, RenderTree, AsciiStyle, search, LevelOrderIter
from anytree.exporter import JsonExporter

# mapping from month numbers to month names
MONTH_DICT = {
    1:'January', 2:'February', 3:'March', 4:'April', 5:'May', 6:'June', 7:'July',
    8:'August', 9:'September', 10:'October', 11:'November', 12:'December'
}

def export_hierarchy(path: str, root: object):
    """
    Exports a given anytree hierarchy to the given path.

    Parameters:
        path (str): filepath to save the tree at
        root (object): anytree node representing the tree

    Returns:
        Nothing
    """

    logging.info(f'saving tree as JSON to "{path}"')
    exporter = JsonExporter(indent=2, sort_keys=True)
    with open(path, 'w') as file:
        exporter.write(root, file)

def filter_time(df: pd.DataFrame):
    """
    Create a tree by filtering the given dataframe based on time (i.e. years and months).

    Parameters:
        df (DataFrame): pandas dataframe holding the data

    Returns:
        root (obj): root node (anytree) of the resulting tree
    """

    key = 'release_date'

    # add columns year and month for easier filtering
    df['year'] = df[key].map(lambda x: x.year)
    df['month'] = df[key].map(lambda x: x.month)
    years = sorted(df['year'].unique())

    root = Node(name='root')

    logging.info(f'tree has {len(years)} different years (top-level nodes)')

    for y in years:

        # get all months for this year
        all_months = sorted(df[df['year'] == y][key].map(lambda x: x.month).unique())
        year_node = Node(str(y), parent=root)
        year_node.year = int(y)

        # add months as leaf nodes
        for m in all_months:
            month_node = Node(MONTH_DICT[m], parent=year_node)
            month_node.year = int(y)
            month_node.month = int(m)

    logging.debug(f'current tree\n{RenderTree(root, style=AsciiStyle()).by_attr()}')
    logging.info('calculating additional information for all leaf nodes ...')

    num_nodes = 1
    # for all nodes, add some data
    for node in LevelOrderIter(root):

        # ignore root node
        if not hasattr(node, 'year'):
            continue

        num_nodes += 1
        if hasattr(node, 'month'):
            # get only the data that matches this node (i.e. same year and month)
            filtered = df[(df['year'] == node.year) & (df['month'] == node.month)]
        else:
            filtered = df[df['year'] == node.year]

        node.count = filtered.shape[0]
        # how to count the different genres for this node
        # can be done for other fields in the same manner, e.g. 'steamspy_tags'
        # could also be filtered before adding, etc.
        # node.genres = filtered.explode('genres')['genres'].value_counts().to_dict()

        # love me some stats
        node.positive_ratings_mean = filtered['positive_ratings'].mean()
        node.negative_ratings_mean = filtered['negative_ratings'].mean()
        node.average_playtime_mean = filtered['average_playtime'].mean()
        node.median_playtime_mean = filtered['median_playtime'].mean()
        node.price_mean = filtered['price'].mean()
        node.achievements_mean = filtered['achievements'].mean()
        logging.debug(f'... updated node {node.name} ({node.year})')

    logging.info(f'final tree contains {num_nodes} nodes (including root)')

    return root

def filter_list(df: pd.DataFrame, key: str, maxdepth: int):
    """
    Create a tree by filtering the given dataframe by the order of occurrences
    of string in a list-like attribute, e.g. the genres.

    Parameters:
        df (DataFrame): pandas dataframe holding the data
        key (str): the column name of the data to structure the tree by
        maxdepth (int): the maximum depth of the tree

    Returns:
        root (obj): root node (anytree) of the resulting tree
    """

    # get the values for the first level of the hierarchy (e.g. the first genres)
    df['g1'] = df[key].map(lambda x: x[0])
    # get unique values for the attribute and sort
    g1 = sorted(df['g1'].unique())

    # the root node of our tree
    root = Node(name='root')

    # add top level nodes
    for g in g1:
        Node(g, parent=root, all=g)

    logging.info(f'first tree level contains {len(g1)} nodes')
    logging.debug(f'current tree\n{RenderTree(root, style=AsciiStyle()).by_attr()}')

    # for each item in our dataset (data frame)
    for d in df.itertuples():

        # get the values for our key (e.g. genres)
        values = getattr(d, key)
        # make them into a single string again (but limited to max depth)
        all_keys = ','.join(values[:maxdepth])
        # find the direct parent node (e.g. 'action' for 'action,adventure')
        parent_node = search.find(
            root,
            lambda node: hasattr(node, 'all') and node.all == all_keys
        )

        # if the parent node does not yet exist, start from the furthest parent and
        # insert missing parents (nodes) until we have the direct parent of our node
        if not parent_node:

            idx = 1
            tmp = ','.join(values[0:idx+1])
            pnode = search.find(root, lambda node: hasattr(node, 'all') and node.all == values[0])

            while idx < maxdepth:
                tmp_node = search.find(root, lambda node: hasattr(node, 'all') and node.all == tmp)
                if not tmp_node:
                    pnode = Node(values[idx], parent=pnode, all=tmp)
                else:
                    pnode = tmp_node
                idx += 1
                tmp = ','.join(values[0:idx+1])

    logging.debug(f'current tree\n{RenderTree(root, style=AsciiStyle()).by_attr()}')

    # add a 'path' column to the dataframe where we store the path up to the max depth
    # for example: 'action,indie,adventure,shooter' could become 'action,indie,adventure'
    # when our max depth value equals 3
    df['path'] = df[key].map(lambda x: ','.join(x[:maxdepth]))

    logging.info(f'calculating additional data for all leaf nodes ...')

    num_nodes = 1
    # iterate over nodes to find update their data
    for node in LevelOrderIter(root):

        # ignore the root node
        if not hasattr(node, 'all'):
            continue

        # for each leaf, add some more data to them like the mean number of positive ratings
        filtered = df[df['path'] == node.all]
        # add count of *exactly* matching instances
        node.count = filtered.shape[0]

        if node.count > 0:
            # how to count count different developers for this node
            # can be done for other fields in the same manner, e.g. 'publisher'
            # could also be filtered before adding, etc.
            # node.developers = filtered.explode('developer')['developer'].value_counts().to_dict()

            # love me some stats
            node.positive_ratings_mean = filtered['positive_ratings'].mean()
            node.negative_ratings_mean = filtered['negative_ratings'].mean()
            node.average_playtime_mean = filtered['average_playtime'].mean()
            node.median_playtime_mean = filtered['median_playtime'].mean()
            node.price_mean = filtered['price'].mean()
            node.achievements_mean = filtered['achievements'].mean()
            logging.debug(f'... updated node {node.all}')

        num_nodes += 1

    logging.info(f'final tree contains {num_nodes} nodes (including root)')

    return root

def make_hierarchy(df: pd.DataFrame, column: str, maxdepth: int = 3, datapath: str = None):
    """
    Creates a hierarchy from the given data frame, based on the given column.
    The resulting tree will be saved as a JSON file.

    Parameters:
        df (DataFrame): pandas dataframe holding the data
        column (str): the column name of the data to structure the tree by
        datapath (str): the path of the original data source
        maxdepth (int): the maximum depth of the tree

    Returns:
        None - if a datapath is given
        root (obj) - if no datapath is given, returns root node (anytree)
    """
    # make all list-like columns into actual lists
    df = common.make_lists(df.copy())

    logging.debug(f'creating hierarchy based on "{column}"')

    # create the hierarchy either based on time or one of the list attributes
    # where the hierarchy represents, e.g. tags, in terms of their order in the list
    if column == 'time':
        # transform date string into datetime
        df['release_date'] = pd.to_datetime(df['release_date'], errors='coerce', exact=False)
        root = filter_time(df)
    else:
        root = filter_list(df, column, maxdepth)

    if datapath is None:
        return root
    else:
        if column == 'time':
            outpath = f'{Path(datapath).stem}_{column}_hierarchy.json'
        else:
            outpath = f'{Path(datapath).stem}_{column}_{maxdepth}_hierarchy.json'

        export_hierarchy(outpath, root)

if __name__ == "__main__":

    # define the arguments for this script
    parser = argparse.ArgumentParser()
    path_arg = parser.add_argument('datapath', help='path to the CSV dataset')
    path_arg.required = True
    attr_arg = parser.add_argument(
        'column',
        help='which column to make the hierarchy from',
        choices=['time'] + common.LIST_ATTRS
    )
    attr_arg.required = True
    parser.add_argument(
        '--maxdepth', '-d',
        type=int,
        help='maximum depth for the tree (ignored for "time"), default is 3',
        metavar='[d > 0]',
        default=3
    )
    parser.add_argument(
        '--loglevel', '-l',
        choices=['DEBUG', 'INFO', 'ERROR'],
        help='set the loggging level, default is INFO',
        default='INFO'
    )

    # parse command line arguments
    args = parser.parse_args()

    common.configure_logger(args.loglevel)

    # read the data file
    try:
        df = common.read_data(args.datapath)
        logging.info(f'loaded data from "{args.datapath}"')
        logging.debug(df)
    except ValueError as e:
        logging.error(e)
        exit(-1)

    make_hierarchy(df, args.column, max(1, args.maxdepth), args.datapath)
