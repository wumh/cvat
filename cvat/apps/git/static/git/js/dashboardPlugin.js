/*
 * Copyright (C) 2018 Intel Corporation
 *
 * SPDX-License-Identifier: MIT
 */

/* global
    showMessage:false
    DashboardView:false
*/

// GIT ENTRYPOINT
window.addEventListener('dashboardReady', () => {
    const reposWindowId = 'gitReposWindow';
    const closeReposWindowButtonId = 'closeGitReposButton';
    const reposURLTextId = 'gitReposURLText';
    const reposSyncButtonId = 'gitReposSyncButton';
    const labelStatusId = 'gitReposLabelStatus';
    const labelMessageId = 'gitReposLabelMessage';
    const createURLInputTextId = 'gitCreateURLInputText';
    const lfsCheckboxId = 'gitLFSCheckbox';

    const reposWindowTemplate = `
        <div id="${reposWindowId}" class="modal">
            <div style="width: 700px; height: auto;" class="modal-content">
                <div style="width: 100%; height: 60%; overflow-y: auto;">
                    <table style="width: 100%;">
                        <tr>
                            <td style="width: 20%;">
                                <label class="regular h2"> 存储库URL: </label>
                            </td>
                            <td style="width: 80%;" colspan="2">
                                <input class="regular h2" type="text" style="width: 92%;" id="${reposURLTextId}" readonly/>
                            </td>
                        </td>
                        <tr>
                            <td style="width: 20%;">
                                <label class="regular h2"> 状态: </label>
                            </td>
                            <td style="width: 60%;">
                                <div>
                                    <label class="regular h2" id="${labelStatusId}"> </label>
                                    <label class="regular h2" id="${labelMessageId}" style="word-break: break-word; user-select: text;"> </label>
                                </div>
                            </td>
                            <td style="width: 20%;">
                                <button style="width: 70%;" id="${reposSyncButtonId}" class="regular h2"> 同步 </button>
                            </td>
                        </tr>
                    </table>
                </div>
                <center>
                    <button id="${closeReposWindowButtonId}" class="regular h1" style="margin-top: 15px;"> 关闭 </button>
                </center>
            </div>
        </div>`;

    $.get('/git/repository/meta/get').done((gitData) => {
        const dashboardItems = $('.dashboardItem');
        dashboardItems.each(function setupDashboardItem() {
            const tid = +this.getAttribute('tid');
            if (tid in gitData) {
                if (['sync', 'syncing'].includes(gitData[tid])) {
                    this.style.background = 'floralwhite';
                } else if (gitData[tid] === 'merged') {
                    this.style.background = 'azure';
                } else {
                    this.style.background = 'mistyrose';
                }

                $('<button> Git存储库同步 </button>').addClass('regular dashboardButtonUI').on('click', () => {
                    $(`#${reposWindowId}`).remove();
                    const gitWindow = $(reposWindowTemplate).appendTo('body');
                    const closeReposWindowButton = $(`#${closeReposWindowButtonId}`);
                    const reposSyncButton = $(`#${reposSyncButtonId}`);
                    const gitLabelMessage = $(`#${labelMessageId}`);
                    const gitLabelStatus = $(`#${labelStatusId}`);
                    const reposURLText = $(`#${reposURLTextId}`);

                    function updateState() {
                        reposURLText.attr('placeholder', '等待服务器响应..');
                        reposURLText.prop('value', '');
                        gitLabelMessage.css('color', '#cccc00').text('等待服务器响应..');
                        gitLabelStatus.css('color', '#cccc00').text('\u25cc');
                        reposSyncButton.attr('disabled', true);

                        $.get(`/git/repository/get/${tid}`).done((data) => {
                            reposURLText.attr('placeholder', '');
                            reposURLText.prop('value', data.url.value);

                            if (!data.status.value) {
                                gitLabelStatus.css('color', 'red').text('\u26a0');
                                gitLabelMessage.css('color', 'red').text(data.status.error);
                                reposSyncButton.attr('disabled', false);
                                return;
                            }

                            if (data.status.value === '!sync') {
                                gitLabelStatus.css('color', 'red').text('\u2606');
                                gitLabelMessage.css('color', 'red').text('存储库未同步');
                                reposSyncButton.attr('disabled', false);
                            } else if (data.status.value === 'sync') {
                                gitLabelStatus.css('color', '#cccc00').text('\u2605');
                                gitLabelMessage.css('color', 'black').text('同步（需要合并）');
                            } else if (data.status.value === 'merged') {
                                gitLabelStatus.css('color', 'darkgreen').text('\u2605');
                                gitLabelMessage.css('color', 'darkgreen').text('同步');
                            } else if (data.status.value === 'syncing') {
                                gitLabelMessage.css('color', '#cccc00').text('同步..');
                                gitLabelStatus.css('color', '#cccc00').text('\u25cc');
                            } else {
                                const message = `有未知的存储库状态: ${data.status.value}`;
                                gitLabelStatus.css('color', 'red').text('\u26a0');
                                gitLabelMessage.css('color', 'red').text(message);
                            }
                        }).fail((data) => {
                            gitWindow.remove();
                            const message = '在获取回购状态期间发生错误. '
                                + `码: ${data.status}, 文本: ${data.responseText || data.statusText}`;
                            showMessage(message);
                        });
                    }

                    closeReposWindowButton.on('click', () => {
                        gitWindow.remove();
                    });

                    reposSyncButton.on('click', () => {
                        function badResponse(message) {
                            try {
                                showMessage(message);
                                throw Error(message);
                            } finally {
                                gitWindow.remove();
                            }
                        }

                        gitLabelMessage.css('color', '#cccc00').text('同步..');
                        gitLabelStatus.css('color', '#cccc00').text('\u25cc');
                        reposSyncButton.attr('disabled', true);

                        $.get(`/git/repository/push/${tid}`).done((rqData) => {
                            function checkCallback() {
                                $.get(`/git/repository/check/${rqData.rq_id}`).done((statusData) => {
                                    if (['queued', 'started'].includes(statusData.status)) {
                                        setTimeout(checkCallback, 1000);
                                    } else if (statusData.status === 'finished') {
                                        updateState();
                                    } else if (statusData.status === 'failed') {
                                        const message = `无法推送到远程存储库. 信息: ${statusData.stderr}`;
                                        badResponse(message);
                                    } else {
                                        const message = `检查返回状态 "${statusData.status}".`;
                                        badResponse(message);
                                    }
                                }).fail((errorData) => {
                                    const message = '在推送回购条目期间发生错误. '
                                        + `码: ${errorData.status}, 文本: ${errorData.responseText || errorData.statusText}`;
                                    badResponse(message);
                                });
                            }

                            setTimeout(checkCallback, 1000);
                        }).fail((errorData) => {
                            const message = '在推送回购条目期间发生错误. '
                                + `码: ${errorData.status}, 文本: ${errorData.responseText || errorData.statusText}`;
                            badResponse(message);
                        });
                    });

                    updateState();
                }).appendTo($(this).find('div.dashboardButtonsUI')[0]);
            }
        });
    }).fail((errorData) => {
        const message = `无法获取存储库元信息. 码: ${errorData.status}. `
            + `信息: ${errorData.responseText || errorData.statusText}`;
        showMessage(message);
    });

    // Setup the "Create task" dialog
    const title = '存储库URL的字段和存储库中的相对路径. \n'
        + '默认存储库路径是 `annotation/<dump_file_name>.zip`. \n'
        + '支持.zip或.xml扩展名.';
    const placeh = 'github.com/user/repos [annotation/<dump_file_name>.zip]';

    $(`
        <tr>
            <td> <label class="regular h2"> 数据集存储库: </label> </td>
            <td>
                <input type="text" id="${createURLInputTextId}" class="regular" style="width: 90%", placeholder="${placeh}" title="${title}"/>
            </td>
        </tr>
        <tr>
            <td> <label class="regular h2" checked> 使用LFS: </label> </td>
            <td> <input type="checkbox" checked id="${lfsCheckboxId}" </td>
        </tr>`).insertAfter($('#dashboardBugTrackerInput').parent().parent());


    DashboardView.registerDecorator('createTask', (taskData, next, onFault) => {
        const taskMessage = $('#dashboardCreateTaskMessage');

        const path = $(`#${createURLInputTextId}`).prop('value').replace(/\s/g, '');
        const lfs = $(`#${lfsCheckboxId}`).prop('checked');

        if (path.length) {
            taskMessage.css('color', 'blue');
            taskMessage.text('正在克隆Git存储库..');

            $.ajax({
                url: `/git/repository/create/${taskData.id}`,
                type: 'POST',
                data: JSON.stringify({
                    path,
                    lfs,
                    tid: taskData.id,
                }),
                contentType: 'application/json',
            }).done((rqData) => {
                function checkCallback() {
                    $.ajax({
                        url: `/git/repository/check/${rqData.rq_id}`,
                        type: 'GET',
                    }).done((statusData) => {
                        if (['queued', 'started'].includes(statusData.status)) {
                            setTimeout(checkCallback, 1000);
                        } else if (statusData.status === 'finished') {
                            taskMessage.css('color', 'blue');
                            taskMessage.text('已经克隆了Git存储库');
                            next();
                        } else if (statusData.status === 'failed') {
                            let message = '存储库状态检查失败. ';
                            if (statusData.stderr) {
                                message += statusData.stderr;
                            }

                            taskMessage.css('color', 'red');
                            taskMessage.text(message);
                            onFault();
                        } else {
                            const message = `存储库状态检查返回状态 "${statusData.status}"`;
                            taskMessage.css('color', 'red');
                            taskMessage.text(message);
                            onFault();
                        }
                    }).fail((errorData) => {
                        const message = `无法发送克隆存储库的请求. 码: ${errorData.status}. `
                            + `信息: ${errorData.responseText || errorData.statusText}`;
                        taskMessage.css('color', 'red');
                        taskMessage.text(message);
                        onFault();
                    });
                }

                setTimeout(checkCallback, 1000);
            }).fail((errorData) => {
                const message = `无法发送克隆存储库的请求. 码: ${errorData.status}. `
                    + `信息: ${errorData.responseText || errorData.statusText}`;
                taskMessage.css('color', 'red');
                taskMessage.text(message);
                onFault();
            });
        } else {
            next();
        }
    });
});
