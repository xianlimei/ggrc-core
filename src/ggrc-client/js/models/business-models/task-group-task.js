/*
 Copyright (C) 2020 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import moment from 'moment';
import Cacheable from '../cacheable';
import Workflow from './workflow';
import TaskGroup from './task-group';
import {getClosestWeekday, DATE_FORMAT} from '../../plugins/utils/date-utils';
import Contactable from '../mixins/contactable';
import AccessControlList from '../mixins/access-control-list';
import Stub from '../stub';

export default Cacheable.extend({
  root_object: 'task_group_task',
  root_collection: 'task_group_tasks',
  findAll: 'GET /api/task_group_tasks',
  create: 'POST /api/task_group_tasks',
  update: 'PUT /api/task_group_tasks/{id}',
  destroy: 'DELETE /api/task_group_tasks/{id}',

  mixins: [Contactable, AccessControlList],
  attributes: {
    context: Stub,
    modified_by: Stub,
    task_group: Stub,
  },
  tree_view_options: {
    attr_list: [
      {attr_title: 'Task Title', attr_name: 'title'},
      {attr_title: 'Task Description', attr_name: 'description'},
    ],
    disable_columns_configuration: true,
    assigneeRoleName: 'Task Assignees',
    secondaryAssigneeRoleName: 'Task Secondary Assignees',
  },

  init: function () {
    let that = this;

    if (this._super) {
      this._super(...arguments);
    }

    this.bind('created', function (ev, instance) {
      if (instance instanceof that) {
        if (TaskGroup.findInCacheById(instance.task_group.id).selfLink) {
          instance._refresh_workflow_people();
        }
      }
    });

    this.bind('updated', function (ev, instance) {
      if (instance instanceof that) {
        instance._refresh_workflow_people();
      }
    });

    this.bind('destroyed', function (ev, instance) {
      let taskGroup;
      if (instance instanceof that) {
        taskGroup = instance.task_group
          && TaskGroup.findInCacheById(instance.task_group.id);
        if (taskGroup
          && taskGroup.selfLink) {
          taskGroup.refresh();
          instance._refresh_workflow_people();
        }
      }
    });
  },
}, {
  define: {
    title: {
      value: '',
      validate: {
        required: true,
      },
    },
    access_control_list: {
      value: [],
      validate: {
        validateAssignee: 'TaskGroupTask',
      },
    },
    start_date: {
      value: '',
      validate: {
        validateStartEndDates: true,
      },
    },
    end_date: {
      value: '',
      validate: {
        validateStartEndDates: true,
      },
    },
  },
  init() {
    if (this._super) {
      this._super(...arguments);
    }
    // default start and end date
    const startDate = this.attr('start_date') || moment();
    const endDate = this.attr('end_date') || moment().add(7, 'days');

    const formattedStartDate = getClosestWeekday(startDate)
      .format(DATE_FORMAT.MOMENT_ISO_DATE);
    const formattedEndDate = getClosestWeekday(endDate)
      .format(DATE_FORMAT.MOMENT_ISO_DATE);

    // Add base values to this property
    this.attr('response_options', []);
    this.attr('start_date', formattedStartDate);
    this.attr('end_date', formattedEndDate);
  },
  _refresh_workflow_people: function () {
    //  TaskGroupTask assignment may add mappings and role assignments in
    //  the backend, so ensure these changes are reflected.
    const taskGroup = TaskGroup.findInCacheById(this.task_group.id);

    if (taskGroup.selfLink) {
      const workflow = Workflow.findInCacheById(taskGroup.workflow.id);
      return workflow.refresh();
    }
  },
});
