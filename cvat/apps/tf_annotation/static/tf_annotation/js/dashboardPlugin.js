/*
 * Copyright (C) 2018 Intel Corporation
 *
 * SPDX-License-Identifier: MIT
 */

/* global
    userConfirm:false
    showMessage:false
*/

window.addEventListener('dashboardReady', () => {
    function checkProcess(tid, button) {
        function checkCallback() {
            $.get(`/tensorflow/annotation/check/task/${tid}`).done((statusData) => {
                if (['started', 'queued'].includes(statusData.status)) {
                    const progress = Math.round(statusData.progress) || '0';
                    button.text(`Cancel TF Annotation (${progress}%)`);
                    setTimeout(checkCallback, 5000);
                } else {
                    button.text('运行TF注释');
                    button.removeClass('tfAnnotationProcess');
                    button.prop('disabled', false);

                    if (statusData.status === 'failed') {
                        const message = `Tensorflow注释失败. 错误: ${statusData.stderr}`;
                        showMessage(message);
                    } else if (statusData.status !== 'finished') {
                        const message = `Tensorflow注释检查请求返回状态 "${statusData.status}"`;
                        showMessage(message);
                    }
                }
            }).fail((errorData) => {
                const message = `无法发送tensorflow注释检查请求. 码: ${errorData.status}. `
                    + `信息: ${errorData.responseText || errorData.statusText}`;
                showMessage(message);
            });
        }

        setTimeout(checkCallback, 5000);
    }


    function runProcess(tid, button) {
        $.get(`/tensorflow/annotation/create/task/${tid}`).done(() => {
            showMessage('流程已经开始');
            button.text('取消TF注释 (0%)');
            button.addClass('tfAnnotationProcess');
            checkProcess(tid, button);
        }).fail((errorData) => {
            const message = `无法运行tf注释. 码: ${errorData.status}. `
                + `信息: ${errorData.responseText || errorData.statusText}`;
            showMessage(message);
        });
    }


    function cancelProcess(tid, button) {
        $.get(`/tensorflow/annotation/cancel/task/${tid}`).done(() => {
            button.prop('disabled', true);
        }).fail((errorData) => {
            const message = `无法取消注释. 码: ${errorData.status}. `
                + `信息: ${errorData.responseText || errorData.statusText}`;
            showMessage(message);
        });
    }


    function setupDashboardItem(item, metaData) {
        const tid = +item.attr('tid');
        const button = $('<button> 运行TF注释 </button>');

        button.on('click', () => {
            if (button.hasClass('tfAnnotationProcess')) {
                userConfirm('该过程将被取消. 继续?', () => {
                    cancelProcess(tid, button);
                });
            } else {
                userConfirm('当前注释将丢失。 你确定吗？', () => {
                    runProcess(tid, button);
                });
            }
        });

        button.addClass('dashboardTFAnnotationButton regular dashboardButtonUI');
        button.appendTo(item.find('div.dashboardButtonsUI'));

        if ((tid in metaData) && (metaData[tid].active)) {
            button.text('取消TF注释');
            button.addClass('tfAnnotationProcess');
            checkProcess(tid, button);
        }
    }

    const elements = $('.dashboardItem');
    const tids = Array.from(elements, el => +el.getAttribute('tid'));

    $.ajax({
        type: 'POST',
        url: '/tensorflow/annotation/meta/get',
        data: JSON.stringify(tids),
        contentType: 'application/json; charset=utf-8',
    }).done((metaData) => {
        elements.each(function setupDashboardItemWrapper() {
            setupDashboardItem($(this), metaData);
        });
    }).fail((errorData) => {
        const message = `无法获得注释元信息. 码: ${errorData.status}. `
            + `信息: ${errorData.responseText || errorData.statusText}`;
        showMessage(message);
    });
});
