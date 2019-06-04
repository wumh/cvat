/*
 * Copyright (C) 2018 Intel Corporation
 *
 * SPDX-License-Identifier: MIT
*/

/* global
    showMessage
    showOverlay
    userConfirm
*/

window.cvat = window.cvat || {};

const AutoAnnotationServer = {
    start(modelId, taskId, data, success, error, progress, check) {
        $.ajax({
            url: `/auto_annotation/start/${modelId}/${taskId}`,
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: (responseData) => {
                check(responseData.id, success, error, progress);
            },
            error: (responseData) => {
                const message = `启动请求失败. 码: ${responseData.status}. 信息: ${responseData.responseText || responseData.statusText}`;
                error(message);
            },
        });
    },

    update(data, success, error, progress, check, modelId) {
        let url = '';
        if (modelId === null) {
            url = '/auto_annotation/create';
        } else {
            url = `/auto_annotation/update/${modelId}`;
        }

        $.ajax({
            url,
            type: 'POST',
            data,
            contentType: false,
            processData: false,
            success: (responseData) => {
                check(responseData.id, success, error, progress);
            },
            error: (responseData) => {
                const message = `创建请求失败. 码: ${responseData.status}. 信息: ${responseData.responseText || responseData.statusText}`;
                error(message);
            },
        });
    },

    delete(modelId, success, error) {
        $.ajax({
            url: `/auto_annotation/delete/${modelId}`,
            type: 'DELETE',
            success,
            error: (data) => {
                const message = `删除请求失败. 码: ${data.status}. 信息: ${data.responseText || data.statusText}`;
                error(message);
            },
        });
    },

    check(workerId, success, error, progress) {
        function updateProgress(data) {
            if (data.progress && progress) {
                progress(data.progress);
            }
        }

        function checkCallback() {
            $.ajax({
                url: `/auto_annotation/check/${workerId}`,
                type: 'GET',
                success: (data) => {
                    updateProgress(data, progress);

                    switch (data.status) {
                    case 'failed':
                        error(`检查请求已返回 "${data.status}" 状态. 信息: ${data.error}`);
                        break;

                    case 'unknown':
                        error(`检查请求已返回 "${data.status}" 状态.`);
                        break;

                    case 'finished':
                        success();
                        break;

                    default:
                        setTimeout(checkCallback, 1000);
                    }
                },
                error: (data) => {
                    const message = `检查请求失败. Code: ${data.status}. 信息: ${data.responseText || data.statusText}`;
                    error(message);
                },
            });
        }

        setTimeout(checkCallback, 1000);
    },

    meta(tids, success, error) {
        $.ajax({
            url: '/auto_annotation/meta/get',
            type: 'POST',
            data: JSON.stringify(tids),
            contentType: 'application/json',
            success,
            error: (data) => {
                const message = `获取元请求失败了. 码: ${data.status}. 信息: ${data.responseText || data.statusText}`;
                error(message);
            },
        });
    },

    cancel(tid, success, error) {
        $.ajax({
            url: `/auto_annotation/cancel/${tid}`,
            type: 'GET',
            success,
            error: (data) => {
                const message = `获取元请求失败了. 码: ${data.status}. 信息: ${data.responseText || data.statusText}`;
                error(message);
            },
        });
    },
};


class AutoAnnotationModelManagerView {
    constructor() {
        const html = `<div class="modal hidden" id="${window.cvat.autoAnnotation.managerWindowId}">
            <div class="modal-content" id="${window.cvat.autoAnnotation.managerContentId}">
                <div style="float: left; width: 55%; height: 100%;">
                    <center>
                        <label class="regular h1"> 上传的模型 </label>
                    </center>
                    <div style="overflow: auto; height: 90%; margin-top: 2%;">
                        <table class="regular modelsTable">
                            <thead>
                                <tr>
                                    <th> 名称 </th>
                                    <th> 上传日期 </th>
                                    <th> 操作 </th>
                                </tr>
                            </thead>
                            <tbody id="${window.cvat.autoAnnotation.managerUploadedModelsId}"> </tbody>
                        </table>
                    </div>
                </div>
                <div class="regular" id="${window.cvat.autoAnnotation.uploadContentId}">
                    <center>
                        <label class="regular h1" id="${window.cvat.autoAnnotation.uploadTitleId}"> 创建模型 </label>
                    </center>
                    <table>
                        <tr>
                            <td style="width: 25%"> <label class="regular h3"> 名称: </label> </td>
                            <td> <input type="text" id="${window.cvat.autoAnnotation.uploadNameInputId}" class="regular h3" style="width: 100%"> </td>
                        </tr>
                        <tr>
                            <td> <label class="regular h3"> 来源: </label> </td>
                            <td>
                                <input id="${window.cvat.autoAnnotation.uploadLocalSourceId}" type="radio" name="modelSourceType" value="local" checked>
                                <label for="${window.cvat.autoAnnotation.uploadLocalSourceId}" class="regular h3"> 本地 </label>
                                <br>
                                <input id="${window.cvat.autoAnnotation.uploadShareSourceId}" type="radio" name="modelSourceType" value="shared">
                                <label for="${window.cvat.autoAnnotation.uploadShareSourceId}" class="regular h3"> 分享 </label>
                            </td>
                        </tr>
                        <tr id="${window.cvat.autoAnnotation.uploadGloballyBlockId}">
                            <td> <label class="regular h3"> 全球上传 </label> </td>
                            <td> <input type="checkbox" id="${window.cvat.autoAnnotation.uploadGloballyId}"> </td>
                        </tr>
                    </table>
                <div style="text-align: left;">
                    <div>
                        <button id="${window.cvat.autoAnnotation.selectFilesButtonId}" class="regular h3"> 选择文件 </button>
                        <label id="${window.cvat.autoAnnotation.selectedFilesId}" class="regular h3" style="margin-left: 10px"> 没有文件 </label>
                        <input id="${window.cvat.autoAnnotation.localFileSelectorId}" type="file" accept=".bin,.xml,.json,.py" style="display: none" multiple>
                    </div>
                </div>
                <div>
                    <div style="float: right; width: 50%; height: 50px;">
                        <button class="regular h3" id="${window.cvat.autoAnnotation.submitUploadButtonId}"> 提交 </button>
                        <button class="regular h3" id="${window.cvat.autoAnnotation.cancelUploadButtonId}"> 取消 </button>
                    </div>
                    <div style="float: left; overflow-y: auto; height: 75px;  overflow: auto; width: 100%; word-break: break-word;">
                        <label class="regular h3 selectable" style="float: left;" id="${window.cvat.autoAnnotation.uploadMessageId}"> </label>
                    </div>
                </div>
            </div>
        </div>`;

        this.el = $(html);

        this.table = this.el.find(`#${window.cvat.autoAnnotation.managerUploadedModelsId}`);
        this.globallyBlock = this.el.find(`#${window.cvat.autoAnnotation.uploadGloballyBlockId}`);
        this.uploadTitle = this.el.find(`#${window.cvat.autoAnnotation.uploadTitleId}`);
        this.uploadNameInput = this.el.find(`#${window.cvat.autoAnnotation.uploadNameInputId}`);
        this.uploadMessage = this.el.find(`#${window.cvat.autoAnnotation.uploadMessageId}`);
        this.selectedFilesLabel = this.el.find(`#${window.cvat.autoAnnotation.selectedFilesId}`);
        this.modelNameInput = this.el.find(`#${window.cvat.autoAnnotation.uploadNameInputId}`);
        this.localSource = this.el.find(`#${window.cvat.autoAnnotation.uploadLocalSourceId}`);
        this.shareSource = this.el.find(`#${window.cvat.autoAnnotation.uploadShareSourceId}`);
        this.cancelButton = this.el.find(`#${window.cvat.autoAnnotation.cancelUploadButtonId}`);
        this.submitButton = this.el.find(`#${window.cvat.autoAnnotation.submitUploadButtonId}`);
        this.globallyBox = this.el.find(`#${window.cvat.autoAnnotation.uploadGloballyId}`);
        this.selectButton = this.el.find(`#${window.cvat.autoAnnotation.selectFilesButtonId}`);
        this.localSelector = this.el.find(`#${window.cvat.autoAnnotation.localFileSelectorId}`);
        this.shareSelector = $('#dashboardShareBrowseModal');
        this.shareBrowseTree = $('#dashboardShareBrowser');
        this.submitShare = $('#dashboardSubmitBrowseServer');

        this.id = null;
        this.source = this.localSource.prop('checked') ? 'local' : 'shared';
        this.files = [];

        function filesLabel(source, files) {
            const fileLabels = source === 'local' ? [...files].map(el => el.name) : files;
            if (fileLabels.length) {
                const labelStr = fileLabels.join(', ');
                if (labelStr.length > 30) {
                    return `${labelStr.substr(0, 30)}..`;
                }

                return labelStr;
            }

            return '没有文件';
        }

        function extractFiles(extensions, files, source) {
            const extractedFiles = {};
            function getExt(file) {
                return source === 'local' ? file.name.split('.').pop() : file.split('.').pop();
            }

            function addFile(file, extention) {
                if (extention in files) {
                    throw Error(`多个带扩展名的文件 .${extention} 已被发现`);
                }

                extractedFiles[extention] = file;
            }

            files.forEach((file) => {
                const fileExt = getExt(file);
                if (extensions.includes(fileExt)) {
                    addFile(file, fileExt);
                }
            });

            return extractedFiles;
        }

        function validateFiles(isUpdate, files, source) {
            const extensions = ['xml', 'bin', 'py', 'json'];
            const extractedFiles = extractFiles(extensions, files, source);

            if (!isUpdate) {
                extensions.forEach((extension) => {
                    if (!(extension in extractedFiles)) {
                        throw Error(`请指定一个 .${extension} 文件`);
                    }
                });
            }

            return extractedFiles;
        }

        this.localSource.on('click', () => {
            if (this.source !== 'local') {
                this.source = 'local';
                this.files = [];
                this.selectedFilesLabel.text(filesLabel(this.source, this.files));
            }
        });

        this.shareSource.on('click', () => {
            if (this.source !== 'shared') {
                this.source = 'shared';
                this.files = [];
                this.selectedFilesLabel.text(filesLabel(this.source, this.files));
            }
        });

        this.selectButton.on('click', () => {
            if (this.source === 'local') {
                this.localSelector.click();
            } else {
                this.shareSelector.appendTo('body');
                this.shareBrowseTree.jstree('refresh');
                this.shareSelector.removeClass('hidden');
                this.shareBrowseTree.jstree({
                    core: {
                        data: {
                            url: 'get_share_nodes',
                            data: node => ({ id: node.id }),
                        },
                    },
                    plugins: ['checkbox', 'sort'],
                });
            }
        });

        this.submitShare.on('click', () => {
            if (!this.el.hasClass('hidden')) {
                this.shareSelector.addClass('hidden');
                this.files = this.shareBrowseTree.jstree(true).get_selected();
                this.selectedFilesLabel.text(filesLabel(this.source, this.files));
            }
        });

        this.localSelector.on('change', (e) => {
            this.files = Array.from(e.target.files);
            this.selectedFilesLabel.text(filesLabel(this.source, this.files));
        });

        this.cancelButton.on('click', () => this.el.addClass('hidden'));
        this.submitButton.on('click', () => {
            try {
                this.submitButton.prop('disabled', true);

                const name = $.trim(this.modelNameInput.prop('value'));
                if (!name.length) {
                    this.uploadMessage.css('color', 'red');
                    this.uploadMessage.text('请指定型号名称');
                    return;
                }

                let validatedFiles = {};
                try {
                    validatedFiles = validateFiles(this.id !== null, this.files, this.source);
                } catch (err) {
                    this.uploadMessage.css('color', 'red');
                    this.uploadMessage.text(err);
                    return;
                }

                const modelData = new FormData();
                modelData.append('name', name);
                modelData.append('storage', this.source);
                modelData.append('shared', this.globallyBox.prop('checked'));

                ['xml', 'bin', 'json', 'py'].filter(e => e in validatedFiles).forEach((ext) => {
                    modelData.append(ext, validatedFiles[ext]);
                });

                this.uploadMessage.text('');
                const overlay = showOverlay('将请求发送到服务器..');
                window.cvat.autoAnnotation.server.update(modelData, () => {
                    window.location.reload();
                }, (message) => {
                    overlay.remove();
                    showMessage(message);
                }, (progress) => {
                    overlay.setMessage(progress);
                }, window.cvat.autoAnnotation.server.check, this.id);
            } finally {
                this.submitButton.prop('disabled', false);
            }
        });
    }

    reset() {
        const setBlocked = () => {
            if (window.cvat.autoAnnotation.data.admin) {
                this.globallyBlock.removeClass('hidden');
            } else {
                this.globallyBlock.addClass('hidden');
            }
        };

        setBlocked();
        this.uploadTitle.text('创建模型');
        this.uploadNameInput.prop('value', '');
        this.uploadMessage.css('color', '');
        this.uploadMessage.text('');
        this.selectedFilesLabel.text('没有文件');
        this.localSource.prop('checked', true);
        this.globallyBox.prop('checked', false);
        this.table.empty();

        this.id = null;
        this.source = this.localSource.prop('checked') ? 'local' : 'share';
        this.files = [];

        const updateButtonClickHandler = (event) => {
            this.reset();

            this.uploadTitle.text('更新模型');
            this.uploadNameInput.prop('value', `${event.data.model.name}`);
            this.id = event.data.model.id;
        };

        const deleteButtonClickHandler = (event) => {
            userConfirm(`你真的想要删除 "${event.data.model.name}" 模块. 你确定吗?`, () => {
                window.cvat.autoAnnotation.server.delete(event.data.model.id, () => {
                    const filtered = window.cvat.autoAnnotation.data.models.filter(
                        item => item !== event.data.model,
                    );
                    window.cvat.autoAnnotation.data.models = filtered;
                    this.reset();
                }, (message) => {
                    showMessage(message);
                });
            });
        };

        const getModelModifyButtons = (model) => {
            if (model.primary) {
                return '<td> <label class="h1 regular"> 主要模型 </label> </td>';
            }

            const updateButtonHtml = '<button class="regular h3" style="width: 7em;"> 更新 </button>';
            const deleteButtonHtml = '<button class="regular h3" style="width: 7em; margin-top: 5%;"> 删除 </button>';

            return $('<td> </td>').append(
                $(updateButtonHtml).on('click', { model }, updateButtonClickHandler),
                $(deleteButtonHtml).on('click', { model }, deleteButtonClickHandler),
            );
        };

        window.cvat.autoAnnotation.data.models.forEach((model) => {
            const rowHtml = `<tr>
                <td> ${model.name} </td>
                <td> ${model.uploadDate} </td>
            </tr>`;

            this.table.append(
                $(rowHtml).append(getModelModifyButtons(model)),
            );
        });

        return this;
    }

    show() {
        this.el.removeClass('hidden');
        return this;
    }

    get element() {
        return this.el;
    }
}


class AutoAnnotationModelRunnerView {
    constructor() {
        const html = `<div class="modal hidden" id="${window.cvat.autoAnnotation.runnerWindowId}">
            <div class="modal-content" id="${window.cvat.autoAnnotation.runnerContentId}">
                <div style="width: 55%; height: 100%; float: left;">
                    <center style="height: 10%;">
                        <label class="regular h1"> 上传的模型 </label>
                    </center>
                    <div style="height: 70%; overflow: auto; margin-top: 2%;">
                        <table class="modelsTable" id="${window.cvat.autoAnnotation.runnerUploadedModelsId}"> </table>
                    </div>
                    <div>
                        <input type="checkbox" id="${window.cvat.autoAnnotation.removeCurrentAnnotationId}"/>
                        <label class="regular h3" for="${window.cvat.autoAnnotation.removeCurrentAnnotationId}"> 删除当前注释 </label>
                    </div>
                </div>
                <div style="width: 40%; height: 100%; float: left; margin-left: 3%;">
                    <center style="height: 10%;">
                        <label class="regular h1"> 注释标签 </label>
                    </center>
                    <div style="height: 70%; overflow: auto; margin-top: 2%;">
                        <table class="regular" style="text-align: center; word-break: break-all; width: 100%;">
                            <thead>
                                <tr style="width: 100%;">
                                    <th style="width: 45%;"> 任务标签 </th>
                                    <th style="width: 45%;"> DL模型标签 </th>
                                    <th style="width: 10%;"> </th>
                                </tr>
                            </thead>
                            <tbody id="${window.cvat.autoAnnotation.annotationLabelsId}">

                            </tbody>
                        </table>
                    </div>
                    <div style="float:right;">
                        <button class="regular h3" style="width: 6em;" id="${window.cvat.autoAnnotation.submitAnnotationId}"> 开始 </button>
                        <button class="regular h3" style="width: 6em;" id="${window.cvat.autoAnnotation.cancelAnnotationId}"> 取消 </button>
                    </div>
                </div>
            </div>
        </div>`;

        this.el = $(html);
        this.id = null;
        this.tid = null;
        this.initButton = null;
        this.modelsTable = this.el.find(`#${window.cvat.autoAnnotation.runnerUploadedModelsId}`);
        this.labelsTable = this.el.find(`#${window.cvat.autoAnnotation.annotationLabelsId}`);
        this.active = null;

        this.el.find(`#${window.cvat.autoAnnotation.cancelAnnotationId}`).on('click', () => {
            this.el.addClass('hidden');
        });

        this.el.find(`#${window.cvat.autoAnnotation.submitAnnotationId}`).on('click', () => {
            try {
                if (this.id === null) {
                    throw Error('请为注释过程指定模型');
                }

                const mapping = {};
                $('.annotatorMappingRow').each((_, element) => {
                    const dlModelLabel = $(element).find('.annotatorDlLabelSelector')[0].value;
                    const taskLabel = $(element).find('.annotatorTaskLabelSelector')[0].value;
                    if (dlModelLabel in mapping) {
                        throw Error(`标签 "${dlModelLabel}" 已被指定两次或更多次`);
                    }
                    mapping[dlModelLabel] = taskLabel;
                });

                if (!Object.keys(mapping).length) {
                    throw Error('尚未找到注释过程的标签');
                }

                const overlay = showOverlay('请求已发送');
                window.cvat.autoAnnotation.server.start(this.id, this.tid, {
                    reset: $(`#${window.cvat.autoAnnotation.removeCurrentAnnotationId}`).prop('checked'),
                    labels: mapping,
                }, () => {
                    overlay.remove();
                    this.initButton[0].setupRun();
                    window.cvat.autoAnnotation.runner.hide();
                }, (message) => {
                    overlay.remove();
                    this.initButton[0].setupRun();
                    showMessage(message);
                }, () => {
                    window.location.reload();
                }, window.cvat.autoAnnotation.server.check);
            } catch (error) {
                showMessage(error);
            }
        });
    }

    reset(data, initButton) {
        function labelsSelect(labels, elClass) {
            const select = $(`<select class="regular h3 ${elClass}" style="width:100%;"> </select>`);
            labels.forEach(label => select.append($(`<option value="${label}"> ${label} </option>`)));
            select.prop('value', null);

            return select;
        }

        function makeCreator(dlSelect, taskSelect, callback) {
            let dlIsFilled = false;
            let taskIsFilled = false;
            const creator = $('<tr style="margin-bottom: 5px;"> </tr>').append(
                $('<td style="width: 45%;"> </td>').append(taskSelect),
                $('<td style="width: 45%;"> </td>').append(dlSelect),
            );

            const onSelectHandler = () => {
                $('<td style="width: 10%; position: relative;"> </td>').append(
                    $('<a class="close"></a>').css('top', '0px').on('click', (e) => {
                        $(e.target.parentNode.parentNode).remove();
                    }),
                ).appendTo(creator);

                creator.addClass('annotatorMappingRow');
                callback();
            };

            dlSelect.on('change', (e) => {
                if (e.target.value && taskIsFilled) {
                    dlSelect.off('change');
                    taskSelect.off('change');
                    onSelectHandler();
                }
                dlIsFilled = Boolean(e.target.value);
            });

            taskSelect.on('change', (e) => {
                if (e.target.value && dlIsFilled) {
                    dlSelect.off('change');
                    taskSelect.off('change');
                    onSelectHandler();
                }

                taskIsFilled = Boolean(e.target.value);
            });

            return creator;
        }

        this.id = null;
        this.initButton = initButton;
        this.tid = data.id;
        this.modelsTable.empty();
        this.labelsTable.empty();
        this.active = null;

        const modelItemClickHandler = (event) => {
            if (this.active) {
                this.active.style.color = '';
            }

            this.id = event.data.model.id;
            this.active = event.target;
            this.active.style.color = 'darkblue';

            this.labelsTable.empty();
            const labels = event.data.data.labels.map(x => x.name);
            const intersection = labels.filter(el => event.data.model.labels.indexOf(el) !== -1);
            intersection.forEach((label) => {
                const dlSelect = labelsSelect(event.data.model.labels, 'annotatorDlLabelSelector');
                dlSelect.prop('value', label);
                const taskSelect = labelsSelect(labels, 'annotatorTaskLabelSelector');
                taskSelect.prop('value', label);
                $('<tr class="annotatorMappingRow" style="margin-bottom: 5px;"> </tr>').append(
                    $('<td style="width: 45%;"> </td>').append(taskSelect),
                    $('<td style="width: 45%;"> </td>').append(dlSelect),
                    $('<td style="width: 10%; position: relative;"> </td>').append(
                        $('<a class="close"></a>').css('top', '0px').on('click', (e) => {
                            $(e.target.parentNode.parentNode).remove();
                        }),
                    ),
                ).appendTo(this.labelsTable);
            });

            const dlSelect = labelsSelect(event.data.model.labels, 'annotatorDlLabelSelector');
            const taskSelect = labelsSelect(labels, 'annotatorTaskLabelSelector');

            const callback = () => {
                makeCreator(
                    labelsSelect(event.data.model.labels, 'annotatorDlLabelSelector'),
                    labelsSelect(labels, 'annotatorTaskLabelSelector'),
                    callback,
                ).appendTo(this.labelsTable);
            };

            makeCreator(dlSelect, taskSelect, callback).appendTo(this.labelsTable);
        };

        window.cvat.autoAnnotation.data.models.forEach((model) => {
            this.modelsTable.append(
                $(`<tr> <td> <label class="regular h3"> ${model.name} (${model.uploadDate}) </label> </td> </tr>`).on(
                    'click', { model, data }, modelItemClickHandler,
                ),
            );
        });

        return this;
    }

    show() {
        this.el.removeClass('hidden');
        return this;
    }

    hide() {
        this.el.addClass('hidden');
        return this;
    }

    get element() {
        return this.el;
    }
}

window.cvat.autoAnnotation = {
    managerWindowId: 'annotatorManagerWindow',
    managerContentId: 'annotatorManagerContent',
    managerUploadedModelsId: 'annotatorManagerUploadedModels',
    uploadContentId: 'annotatorManagerUploadModel',
    uploadTitleId: 'annotatorManagerUploadTitle',
    uploadNameInputId: 'annotatorManagerUploadNameInput',
    uploadLocalSourceId: 'annotatorManagerUploadLocalSource',
    uploadShareSourceId: 'annotatorManagerUploadShareSource',
    uploadGloballyId: 'annotatorManagerUploadGlobally',
    uploadGloballyBlockId: 'annotatorManagerUploadGloballyblock',
    selectFilesButtonId: 'annotatorManagerUploadSelector',
    selectedFilesId: 'annotatorManagerUploadSelectedFiles',
    localFileSelectorId: 'annotatorManagerUploadLocalSelector',
    shareFileSelectorId: 'annotatorManagerUploadShareSelector',
    submitUploadButtonId: 'annotatorManagerSubmitUploadButton',
    cancelUploadButtonId: 'annotatorManagerCancelUploadButton',
    uploadMessageId: 'annotatorUploadStatusMessage',

    runnerWindowId: 'annotatorRunnerWindow',
    runnerContentId: 'annotatorRunnerContent',
    runnerUploadedModelsId: 'annotatorRunnerUploadedModels',
    removeCurrentAnnotationId: 'annotatorRunnerRemoveCurrentAnnotationBox',
    annotationLabelsId: 'annotatorRunnerAnnotationLabels',
    submitAnnotationId: 'annotatorRunnerSubmitAnnotationButton',
    cancelAnnotationId: 'annotatorRunnerCancelAnnotationButton',

    managerButtonId: 'annotatorManagerButton',
};

window.addEventListener('DOMContentLoaded', () => {
    window.cvat.autoAnnotation.server = AutoAnnotationServer;
    window.cvat.autoAnnotation.manager = new AutoAnnotationModelManagerView();
    window.cvat.autoAnnotation.runner = new AutoAnnotationModelRunnerView();

    $('body').append(window.cvat.autoAnnotation.manager.element, window.cvat.autoAnnotation.runner.element);
    $(`<button id="${window.cvat.autoAnnotation.managerButtonId}" class="regular h1" style=""> 模型管理</button>`)
        .on('click', () => {
            const overlay = showOverlay('管理员正在筹建中..');
            window.cvat.autoAnnotation.manager.reset().show();
            overlay.remove();
        }).appendTo('#dashboardManageButtons');
});

window.addEventListener('dashboardReady', (event) => {
    const elements = $('.dashboardItem');
    const tids = Array.from(elements, el => +el.getAttribute('tid'));

    window.cvat.autoAnnotation.server.meta(tids, (data) => {
        window.cvat.autoAnnotation.data = data;

        elements.each(function setupDashboardItem() {
            const elem = $(this);
            const tid = +elem.attr('tid');

            const button = $('<button> Run Auto Annotation </button>').addClass('regular dashboardButtonUI');
            button[0].setupRun = function setupRun() {
                const self = $(this);
                const taskInfo = event.detail.filter(task => task.id === tid)[0];
                self.text('运行自动注释').off('click').on('click', () => {
                    window.cvat.autoAnnotation.runner.reset(taskInfo, self).show();
                });
            };

            button[0].setupCancel = function setupCancel() {
                const self = $(this);
                self.off('click').text('取消自动注释').on('click', () => {
                    userConfirm('流程将被取消.你确定吗?', () => {
                        window.cvat.autoAnnotation.server.cancel(tid, () => {
                            this.setupRun();
                        }, (message) => {
                            showMessage(message);
                        });
                    });
                });

                window.cvat.autoAnnotation.server.check(
                    window.cvat.autoAnnotation.data.run[tid].rq_id,
                    () => {
                        this.setupRun();
                    },
                    (error) => {
                        button[0].setupRun();
                        button.text('注释失败');
                        button.title(error);
                    },
                    (progress) => {
                        button.text(`取消自动注释 (${progress.toString().slice(0, 4)})%`);
                    },
                );
            };

            const taskStatus = window.cvat.autoAnnotation.data.run[tid];
            if (taskStatus && ['queued', 'started'].includes(taskStatus.status)) {
                button[0].setupCancel();
            } else {
                button[0].setupRun();
            }

            button.appendTo(elem.find('div.dashboardButtonsUI')[0]);
        });
    }, (error) => {
        showMessage(`无法获取模型元信息: ${error}`);
    });
});
