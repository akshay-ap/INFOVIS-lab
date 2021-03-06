# https://planspace.org/20151129-see_sklearn_trees_with_d3/
def rules(clf, features, labels, node_index=0):
    """Structure of rules in a fit decision tree classifier

    Parameters
    ----------
    clf : DecisionTreeClassifier
        A tree that has already been fit.

    features, labels : lists of str
        The names of the features and labels, respectively.

    """
    node = {}
    if clf.tree_.children_left[node_index] == -1:  # indicates leaf
        count_labels = zip(clf.tree_.value[node_index, 0], labels)
        node['other'] = ', '.join(('{} of {}'.format(int(count), label)
                                  for count, label in count_labels))
        
        
        max_value = None
        max_label = None
        for count, label in zip(clf.tree_.value[node_index, 0], labels):
            if (max_value is None or count > max_value):
                max_value = count
                max_label = label
        node['label'] = max_label
        node['name'] = max_label
    else:
        feature = features[clf.tree_.feature[node_index]]
        threshold = clf.tree_.threshold[node_index]
        node['name'] = '{} > {}'.format(feature, threshold)
        node['label'] = feature
        left_index = clf.tree_.children_left[node_index]
        right_index = clf.tree_.children_right[node_index]
        node['children'] = [rules(clf, features, labels, right_index),
                            rules(clf, features, labels, left_index)]
    return node