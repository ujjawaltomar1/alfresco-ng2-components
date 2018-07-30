/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import LoginPage = require('./pages/adf/loginPage');
import ProcessServicesPage = require('./pages/adf/process_services/processServicesPage');
import TasksPage = require('./pages/adf/process_services/tasksPage');

import CONSTANTS = require('./util/constants');

import Tenant = require('./models/APS/Tenant');
import Task = require('./models/APS/Task');
import TaskModel = require('./models/APS/TaskModel');
import FormModel = require('./models/APS/FormModel');
import FileModel = require('./models/ACS/fileModel');

import TestConfig = require('./test.config');
import resources = require('./util/resources');

import dateFormat = require('dateformat');

import AlfrescoApi = require('alfresco-js-api-node');
import { UsersActions } from './actions/users.actions';
import { AppsActions } from './actions/APS/apps.actions';

import fs = require('fs');
import path = require('path');
import Util = require('./util/util');

describe('Start Task - Task App', () => {

    let loginPage = new LoginPage();
    let processServicesPage = new ProcessServicesPage();
    let processUserModel;
    let app = resources.Files.SIMPLE_APP_WITH_USER_FORM;
    let taskPage = new TasksPage();
    let taskTaskApp = 'Audit task task app';
    let taskCustomApp = 'Audit task custom app';
    let taskCompleteCustomApp = 'Audit completed task custom app';
    let auditLogFile = path.join('./e2e/download/', 'Audit.pdf');
    let appModel;

    beforeAll(async (done) => {
        let users = new UsersActions();
        let apps = new AppsActions();

        this.alfrescoJsApi = new AlfrescoApi({
            provider: 'BPM',
            hostBpm: TestConfig.adf.url
        });

        await this.alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);

        let newTenant = await this.alfrescoJsApi.activiti.adminTenantsApi.createTenant(new Tenant());

        processUserModel = await users.createApsUser(this.alfrescoJsApi, newTenant.id);

        await this.alfrescoJsApi.login(processUserModel.email, processUserModel.password);

        this.alfrescoJsApi.activiti.taskApi.createNewTask({name: taskTaskApp});

        appModel = await apps.importPublishDeployApp(this.alfrescoJsApi, app.file_location);

        loginPage.loginToProcessServicesUsingUserModel(processUserModel);

        done();
    });

    it('[C260386] Should Audit file be downloaded when clicking on Task Audit log icon on a standalone running task', () => {
        processServicesPage.goToProcessServices().goToTaskApp().clickTasksButton();
        taskPage.usingFiltersPage().goToFilter(CONSTANTS.TASKFILTERS.MY_TASKS);
        taskPage.usingTasksListPage().checkTaskIsDisplayedInTasksList(taskTaskApp);

        taskPage.usingTaskDetails().clickAuditLogButton();
        expect(Util.fileExists(auditLogFile, 10)).toBe(true);
    });

    it('[C260389] Should Audit file be downloaded when clicking on Task Audit log icon on a standalone completed task', () => {
        processServicesPage.goToProcessServices().goToTaskApp().clickTasksButton();
        taskPage.usingFiltersPage().goToFilter(CONSTANTS.TASKFILTERS.MY_TASKS);
        taskPage.usingTasksListPage().checkTaskIsDisplayedInTasksList(taskTaskApp);

        taskPage.completeTaskNoForm();
        taskPage.usingFiltersPage().goToFilter(CONSTANTS.TASKFILTERS.COMPL_TASKS);
        taskPage.usingTasksListPage().selectTaskFromTasksList(taskTaskApp);
        expect(taskPage.usingFormFields().getCompletedTaskNoFormMessage()).toEqual('Task ' + taskTaskApp + ' completed');

        taskPage.usingTaskDetails().clickAuditLogButton();
        expect(Util.fileExists(auditLogFile, 20)).toBe(true);
    });

    it('[C263944] Should Audit file be downloaded when clicking on Task Audit log icon on a custom app standalone completed task', () => {
        processServicesPage.goToProcessServices().goToTaskApp().clickTasksButton();

        taskPage.createNewTask().addName(taskCompleteCustomApp).clickStartButton();

        taskPage.usingFiltersPage().goToFilter(CONSTANTS.TASKFILTERS.MY_TASKS);
        taskPage.usingTasksListPage().checkTaskIsDisplayedInTasksList(taskCompleteCustomApp);

        taskPage.completeTaskNoForm();
        taskPage.usingFiltersPage().goToFilter(CONSTANTS.TASKFILTERS.COMPL_TASKS);
        taskPage.usingTasksListPage().selectTaskFromTasksList(taskCompleteCustomApp);
        expect(taskPage.usingFormFields().getCompletedTaskNoFormMessage()).toEqual('Task ' + taskCompleteCustomApp + ' completed');

        taskPage.usingTaskDetails().clickAuditLogButton();
        expect(Util.fileExists(auditLogFile, 20)).toBe(true);
    });

    it('[C263943] Should Audit file be downloaded when clicking on Task Audit log icon on a custom app standalone running task', () => {
        processServicesPage.goToProcessServices().goToApp(appModel.name).clickTasksButton();

        taskPage.createNewTask().addName(taskCustomApp).clickStartButton();

        taskPage.usingFiltersPage().goToFilter(CONSTANTS.TASKFILTERS.MY_TASKS);
        taskPage.usingTasksListPage().checkTaskIsDisplayedInTasksList(taskCustomApp);

        taskPage.usingTaskDetails().clickAuditLogButton();
        expect(Util.fileExists(auditLogFile, 10)).toBe(true);
    });

});