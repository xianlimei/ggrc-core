# Copyright (C) 2018 Google Inc.
# Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
"""Workflow smoke tests."""
# pylint: disable=no-self-use
# pylint: disable=unused-argument
import pytest

from lib import base
from lib.entities import app_entity_factory
from lib.page.widget import workflow_tabs
from lib.ui import workflow_ui_facade, ui_facade
from lib.utils import test_utils


class TestCreateWorkflow(base.Test):
  """Tests for checking results of workflow creation."""

  @pytest.fixture()
  def workflow(self):
    """Create workflow via UI."""
    workflow = app_entity_factory.WorkflowFactory().create()
    workflow.task_groups = [app_entity_factory.TaskGroupFactory().create(
        workflow=workflow)]
    workflow_ui_facade.create_workflow(workflow)
    return workflow

  def test_setup_tab_is_opened_after_create_workflow(self, selenium, workflow):
    """Test that creation of workflow via UI redirects to Setup tab."""
    # pylint: disable=invalid-name
    workflow_tabs.SetupTab().wait_to_be_init()
    assert ui_facade.active_tab_name() == "Setup (1)"

  def test_create_workflow(self, selenium, workflow):
    """Test that creation of workflow via UI corrects a correct object."""
    actual_workflow = ui_facade.get_obj(workflow)
    test_utils.obj_assert(actual_workflow, workflow)

  def test_create_workflow_creates_task_group(self, selenium, workflow):
    """Test that creation of workflow via UI creates a task group."""
    # pylint: disable=invalid-name
    actual_task_groups = workflow_ui_facade.task_group_objs(
        workflow)
    test_utils.list_obj_assert(actual_task_groups, workflow.task_groups)


class TestWorkflowPage(base.Test):
  """Test workflow page."""

  def test_create_task_group_task(
      self, app_workflow, app_task_group, app_person, selenium
  ):
    """Test creation of Task Group Task."""
    task = app_entity_factory.TaskGroupTaskFactory().create(
        task_group=app_task_group, assignees=[app_person])
    workflow_ui_facade.create_task_group_task(task)
    actual_tasks = workflow_ui_facade.get_task_group_tasks_objs()
    test_utils.list_obj_assert(actual_tasks, [task])
