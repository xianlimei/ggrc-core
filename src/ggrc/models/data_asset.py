# Copyright (C) 2020 Google Inc.
# Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>

"""Module for DataAsset object"""
from ggrc import db
from ggrc.fulltext.mixin import Indexed
from ggrc.models import mixins
from ggrc.models.mixins import synchronizable
from ggrc.models.comment import ScopedCommentable
from ggrc.models.object_document import PublicDocumentable
from ggrc.models.object_person import Personable
from ggrc.models.relationship import Relatable


class DataAsset(synchronizable.RoleableSynchronizable,
                PublicDocumentable,
                synchronizable.Synchronizable,
                mixins.CustomAttributable,
                Personable,
                Relatable,
                ScopedCommentable,
                mixins.TestPlanned,
                mixins.LastDeprecatedTimeboxed,
                mixins.base.ContextRBAC,
                mixins.Folderable,
                mixins.ScopeObject,
                mixins.WithWorkflowState,
                Indexed,
                db.Model):
  """Class representing DataAsset."""

  __tablename__ = 'data_assets'

  _aliases = {
      "documents_file": None,
  }
