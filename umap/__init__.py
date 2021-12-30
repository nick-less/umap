"Create maps with OpenStreetMap layers in a minute and embed them in your site."

with open("umap/version.txt") as v_file:
  __version__ = v_file.read()

__author__ = 'Yohan Boniface'
__contact__ = "ybon@openstreetmap.fr"
__homepage__ = "https://github.com/umap-project/umap"
try:
    import pkg_resources
except ImportError:  # pragma: no cover
    pass
else:
    if __package__:
        VERSION = pkg_resources.get_distribution("umap-project").version
