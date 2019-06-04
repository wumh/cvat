/*
 * Copyright (C) 2018 Intel Corporation
 *
 * SPDX-License-Identifier: MIT
 */

window.addEventListener('DOMContentLoaded', () => {
    $('<button class="menuButton semiBold h2"> 打开任务 </button>').on('click', () => {
        const win = window.open(`${window.location.origin}/dashboard/?id=${window.cvat.job.task_id}`, '_blank');
        win.focus();
    }).prependTo('#engineMenuButtons');
});
