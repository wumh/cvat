/*
 * Copyright (C) 2018 Intel Corporation
 *
 * SPDX-License-Identifier: MIT
 */

/* global showMessage userConfirm */


document.addEventListener('DOMContentLoaded', () => {
    async function run(overlay, cancelButton, thresholdInput, distanceInput) {
        const collection = window.cvat.data.get();
        const data = {
            threshold: +thresholdInput.prop('value'),
            maxDistance: +distanceInput.prop('value'),
            boxes: collection.shapes.filter(el => el.type === 'rectangle'),
        };

        overlay.removeClass('hidden');
        cancelButton.prop('disabled', true);

        async function checkCallback() {
            let jobData = null;
            try {
                jobData = await $.get(`/reid/check/${window.cvat.job.id}`);
            } catch (errorData) {
                overlay.addClass('hidden');
                const message = `无法检查ReID合并. 码: ${errorData.status}. `
                    + `信息: ${errorData.responseText || errorData.statusText}`;
                showMessage(message);
            }

            if (jobData.progress) {
                cancelButton.text(`取消ReID合并 (${jobData.progress.toString().slice(0, 4)}%)`);
            }

            if (['queued', 'started'].includes(jobData.status)) {
                setTimeout(checkCallback, 1000);
            } else {
                overlay.addClass('hidden');

                if (jobData.status === 'finished') {
                    if (jobData.result) {
                        const result = JSON.parse(jobData.result);
                        collection.shapes = collection.shapes
                            .filter(el => el.type !== 'rectangle');
                        collection.tracks = collection.tracks
                            .concat(result);

                        window.cvat.data.clear();
                        window.cvat.data.set(collection);

                        showMessage('ReID合并已经完成.');
                    } else {
                        showMessage('ReID合并已被取消.');
                    }
                } else if (jobData.status === 'failed') {
                    const message = `ReID合并已经下降. 错误: '${jobData.stderr}'`;
                    showMessage(message);
                } else {
                    let message = `检查请求已返回 "${jobData.status}" 状态.`;
                    if (jobData.stderr) {
                        message += ` 错误: ${jobData.stderr}`;
                    }
                    showMessage(message);
                }
            }
        }

        try {
            await $.ajax({
                url: `/reid/start/job/${window.cvat.job.id}`,
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
            });

            setTimeout(checkCallback, 1000);
        } catch (errorData) {
            overlay.addClass('hidden');
            const message = `无法启动ReID合并. 码: ${errorData.status}. `
                + `信息: ${errorData.responseText || errorData.statusText}`;
            showMessage(message);
        } finally {
            cancelButton.prop('disabled', false);
        }
    }

    async function cancel(overlay, cancelButton) {
        cancelButton.prop('disabled', true);
        try {
            await $.get(`/reid/cancel/${window.cvat.job.id}`);
            overlay.addClass('hidden');
            cancelButton.text('取消ReID合并 (0%)');
        } catch (errorData) {
            const message = `无法取消ReID进程. 码: ${errorData.status}. 信息: ${errorData.responseText || errorData.statusText}`;
            showMessage(message);
        } finally {
            cancelButton.prop('disabled', false);
        }
    }

    const buttonsUI = $('#engineMenuButtons');
    const reidWindowId = 'reidSubmitWindow';
    const reidThresholdValueId = 'reidThresholdValue';
    const reidDistanceValueId = 'reidDistanceValue';
    const reidCancelMergeId = 'reidCancelMerge';
    const reidSubmitMergeId = 'reidSubmitMerge';
    const reidCancelButtonId = 'reidCancelReID';
    const reidOverlay = 'reidOverlay';

    $('<button> 运行ReID合并 </button>').on('click', () => {
        $('#annotationMenu').addClass('hidden');
        $(`#${reidWindowId}`).removeClass('hidden');
    }).addClass('menuButton semiBold h2').prependTo(buttonsUI);

    $(`
        <div class="modal hidden" id="${reidWindowId}">
            <div class="modal-content" style="width: 300px; height: 170px;">
                <table>
                    <tr>
                        <td> <label class="regular h2"> Threshold: </label> </td>
                        <td> <input id="${reidThresholdValueId}" class="regular h1" type="number"`
                        + `title="对象嵌入之间的最大余弦距离" min="0.05" max="0.95" value="0.5" step="0.05"> </td>
                    </tr>
                    <tr>
                        <td> <label class="regular h2"> 最大像素距离 </label> </td>
                        <td> <input id="${reidDistanceValueId}" class="regular h1" type="number"`
                        + `title="对象在相邻帧之间可以发散的最大半径" min="10" max="1000" value="50" step="10"> </td>
                    </tr>
                    <tr>
                        <td colspan="2"> <label class="regular h2" style="color: red;"> 所有框都将转换为框路径. 继续? </label> </td>
                    </tr>
                </table>
                <center style="margin-top: 10px;">
                    <button id="${reidCancelMergeId}" class="regular h2"> Cancel </button>
                    <button id="${reidSubmitMergeId}" class="regular h2"> Merge </button>
                </center>
            </div>
        </div>
    `).appendTo('body');

    $(`
        <div class="modal hidden force-modal" id="${reidOverlay}">
            <div class="modal-content" style="width: 300px; height: 70px;">
                <center> <label class="regular h2"> ReID正在处理数据 </label></center>
                <center style="margin-top: 5px;">
                    <button id="${reidCancelButtonId}" class="regular h2" style="width: 250px;"> 取消ReID合并 (0%) </button>
                </center>
            </div>
        </div>
    `).appendTo('body');

    $(`#${reidCancelMergeId}`).on('click', () => {
        $(`#${reidWindowId}`).addClass('hidden');
    });

    $(`#${reidCancelButtonId}`).on('click', () => {
        userConfirm('ReID流程将被取消。 你确定吗？', () => {
            cancel($(`#${reidOverlay}`), $(`#${reidCancelButtonId}`));
        });
    });

    $(`#${reidSubmitMergeId}`).on('click', () => {
        $(`#${reidWindowId}`).addClass('hidden');
        run($(`#${reidOverlay}`), $(`#${reidCancelButtonId}`),
            $(`#${reidThresholdValueId}`), $(`#${reidDistanceValueId}`))
            .catch((error) => {
                setTimeout(() => {
                    throw error;
                });
            });
    });
});
