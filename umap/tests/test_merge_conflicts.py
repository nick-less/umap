from umap.utils import merge_conflicts


def test_adding_one_element():
    assert merge_conflicts(["A", "B"], ["A", "B", "C"], ["A", "B", "D"]) == [
        "A",
        "B",
        "C",
        "D",
    ]


def test_adding_elements():
    assert merge_conflicts(["A", "B"], ["A", "B", "C", "D"], ["A", "B", "E", "F"]) == [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
    ]
    # Order does not count
    assert merge_conflicts(["A", "B"], ["B", "C", "D", "A"], ["A", "B", "E", "F"]) == [
        "B",
        "C",
        "D",
        "A",
        "E",
        "F",
    ]


def test_adding_one_removing_one():
    assert merge_conflicts(["A", "B"], ["A", "C"], ["A", "B", "D"]) == [
        "A",
        "C",
        "D",
    ]


def test_removing_same_element():
    # No added element (otherwise we cannot know if "new" elements are old modified
    # or old removed and new added).
    assert merge_conflicts(["A", "B", "C"], ["A", "B"], ["A", "B"]) == [
        "A",
        "B",
    ]


def test_removing_changed_element():
    assert merge_conflicts(["A", "B"], ["A", "C"], ["A"]) is False


def test_changing_removed_element():
    assert merge_conflicts(["A", "B"], ["A"], ["A", "C"]) is False


def test_changing_same_element():
    assert merge_conflicts(["A", "B"], ["A", "D"], ["A", "C"]) is False
    # Order does not count
    assert merge_conflicts(["A", "B", "C"], ["B", "D", "A"], ["A", "E", "B"]) is False
