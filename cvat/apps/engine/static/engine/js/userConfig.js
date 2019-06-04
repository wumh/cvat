/*
 * Copyright (C) 2018 Intel Corporation
 *
 * SPDX-License-Identifier: MIT
 */

/* exported Config */

class Config {
    constructor() {
        this._username = '_default_';
        this._shortkeys = {
            switch_lock_property: {
                value: 'l',
                view_value: 'L',
                description: '切换活动形状的锁定属性',
            },

            switch_all_lock_property: {
                value: 't l',
                view_value: 'T + L',
                description: '切换当前帧上所有形状的锁定属性',
            },

            switch_occluded_property: {
                value: 'q,/'.split(','),
                view_value: 'Q or Num Devision',
                description: '切换活动形状的遮挡属性',
            },

            switch_draw_mode: {
                value: 'n',
                view_value: 'N',
                description: '开始绘制/停止绘制',
            },

            switch_merge_mode: {
                value: 'm',
                view_value: 'M',
                description: '开始合并/应用更改',
            },

            switch_group_mode: {
                value: 'g',
                view_value: 'G',
                description: '开始组/应用更改',
            },

            reset_group: {
                value: 'shift+g',
                view_value: 'Shift + G',
                description: '重置所选形状的组',
            },

            change_shape_label: {
                value: 'ctrl+1,ctrl+2,ctrl+3,ctrl+4,ctrl+5,ctrl+6,ctrl+7,ctrl+8,ctrl+9'.split(','),
                view_value: 'Ctrl + (1,2,3,4,5,6,7,8,9)',
                description: '更改现有对象的形状标签',
            },

            change_default_label: {
                value: 'shift+1,shift+2,shift+3,shift+4,shift+5,shift+6,shift+7,shift+8,shift+9'.split(','),
                view_value: 'shift + (1,2,3,4,5,6,7,8,9)',
                description: '更改标签默认标签',
            },

            change_default_shape: {
                view_value: 'b-框,p-点,a-自动注释,s-多边形,l-折线',
                description: '更改图形类型'
            },


            change_shape_color: {
                value: 'enter',
                view_value: 'Enter',
                description: '改变突出形状的颜色',
            },

            change_player_brightness: {
                value: 'shift+b,alt+b'.split(','),
                view_value: 'Shift+B / Alt+B',
                description: '增加/减少图像的亮度',
            },

            change_player_contrast: {
                value: 'shift+c,alt+c'.split(','),
                view_value: 'Shift+C / Alt+C',
                description: '增加/减少图像的对比度',
            },

            change_player_saturation: {
                value: 'shift+s,alt+s'.split(','),
                view_value: 'Shift+S / Alt+S',
                description: '增加/减少图像的饱和度',
            },

            switch_hide_mode: {
                value: 'h',
                view_value: 'H',
                description: '切换活动形状的隐藏模式',
            },

            switch_active_keyframe: {
                value: 'k',
                view_value: 'K',
                description: '切换活动形状的关键帧属性',
            },

            switch_active_outside: {
                value: 'o',
                view_value: 'O',
                description: '切换外部属性以获得活动形状',
            },

            switch_all_hide_mode: {
                value: 't h',
                view_value: 'T + H',
                description: '切换所有形状的隐藏模式',
            },

            delete_shape: {
                value: 'del,shift+del'.split(','),
                view_value: 'Del, Shift + Del',
                description: '删除活动形状（使用shift删除强制）',
            },

            focus_to_frame: {
                value: '`,~'.split(','),
                view_value: '~ / `',
                description: '专注于“去框架”元素',
            },

            next_frame: {
                value: 'f',
                view_value: 'F',
                description: '转到下一个玩家框架',
            },

            prev_frame: {
                value: 'd',
                view_value: 'D',
                description: '移到上一个播放器框架',
            },

            forward_frame: {
                value: 'v',
                view_value: 'V',
                description: '前进几帧',
            },

            backward_frame: {
                value: 'c',
                view_value: 'C',
                description: '向后移动几帧',
            },

            next_key_frame: {
                value: 'r',
                view_value: 'R',
                description: '移动到突出显示的轨道的下一个关键帧',
            },

            prev_key_frame: {
                value: 'e',
                view_value: 'E',
                description: '移动到突出显示的轨道的上一个关键帧',
            },

            prev_filter_frame: {
                value: 'left',
                view_value: 'Left Arrow',
                description: '移动到满足过滤器的prev框架',
            },

            next_filter_frame: {
                value: 'right',
                view_value: 'Right Arrow',
                description: '移动到满足过滤器的下一帧',
            },

            play_pause: {
                value: 'space',
                view_value: 'Space',
                description: '切换播放器的播放/暂停',
            },

            open_help: {
                value: 'f1',
                view_value: 'F1',
                description: '打开帮助窗口',
            },

            open_settings: {
                value: 'f2',
                view_value: 'F2',
                description: '打开设置窗口',
            },

            save_work: {
                value: 'ctrl+s',
                view_value: 'Ctrl + S',
                description: '保存服务器上的工作',
            },

            copy_shape: {
                value: 'ctrl+c',
                view_value: 'Ctrl + C',
                description: '将活动形状复制到缓冲区',
            },

            propagate_shape: {
                value: 'ctrl+b',
                view_value: 'Ctrl + B',
                description: '传播活跃的形状',
            },

            switch_paste: {
                value: 'ctrl+v',
                view_value: 'Ctrl + V',
                description: 'swich粘贴模式',
            },

            switch_aam_mode: {
                value: 'shift+enter',
                view_value: 'Shift + Enter',
                description: '切换属性注释模式',
            },

            aam_next_attribute: {
                value: 'down',
                view_value: 'Down Arrow',
                description: '移动到属性注释模式中的下一个属性',
            },

            aam_prev_attribute: {
                value: 'up',
                view_value: 'Up Arrow',
                description: '移动到属性注释模式中的上一个属性',
            },

            aam_next_shape: {
                value: 'tab',
                view_value: 'Tab',
                description: '在属性注释模式中移动到下一个形状',
            },

            aam_prev_shape: {
                value: 'shift+tab',
                view_value: 'Shift + Tab',
                description: '在属性注释模式中移动到上一个形状',
            },

            select_i_attribute: {
                value: '1,2,3,4,5,6,7,8,9,0'.split(','),
                view_value: '1,2,3,4,5,6,7,8,9,0',
                description: '在属性注释模式中设置相应的属性值',
            },

            change_grid_opacity: {
                value: ['alt+g+=', 'alt+g+-'],
                view_value: 'Alt + G + "+", Alt + G + "-"',
                description: '增加/减少网格不透明度',
            },

            change_grid_color: {
                value: 'alt+g+enter',
                view_value: 'Alt + G + Enter',
                description: '改变网格颜色',
            },

            undo: {
                value: 'ctrl+z',
                view_value: 'Ctrl + Z',
                description: '撤消',
            },

            redo: {
                value: ['ctrl+shift+z', 'ctrl+y'],
                view_value: 'Ctrl + Shift + Z / Ctrl + Y',
                description: '重做',
            },

            cancel_mode: {
                value: 'esc',
                view_value: 'Esc',
                description: '取消活动模式',
            },

            clockwise_rotation: {
                value: 'ctrl+r',
                view_value: 'Ctrl + R',
                description: '顺时针图像旋转',
            },

            counter_clockwise_rotation: {
                value: 'ctrl+shift+r',
                view_value: 'Ctrl + Shift + R',
                description: '逆时针图像旋转',
            },

            next_shape_type: {
                value: ['alt+.'],
                view_value: 'Alt + >',
                description: '切换下一个默认形状类型',
            },

            prev_shape_type: {
                value: ['alt+,'],
                view_value: 'Alt + <',
                description: '切换以前的默认形状类型',
            },
        };

        if (window.cvat && window.cvat.job && window.cvat.job.z_order) {
            this._shortkeys.inc_z = {
                value: '+,='.split(','),
                view_value: '+',
                description: '增加活动形状的z顺序',
            };

            this._shortkeys.dec_z = {
                value: '-,_'.split(','),
                view_value: '-',
                description: '减少活动形状的z次序',
            };
        }

        this._settings = {
            player_step: {
                value: '10',
                description: '向前/向后移动几个帧时玩家的步长',
            },

            player_speed: {
                value: '25 FPS',
                description: '播放器的播放速度',
            },

            reset_zoom: {
                value: 'false',
                description: '在帧之间移动时重置帧缩放',
            },

            enable_auto_save: {
                value: 'false',
                description: '启用自动保存功能',
            },

            auto_save_interval: {
                value: '15',
                description: '自动保存间隔(分钟)',
            },
        };

        this._defaultShortkeys = JSON.parse(JSON.stringify(this._shortkeys));
        this._defaultSettings = JSON.parse(JSON.stringify(this._settings));
    }


    reset() {
        this._shortkeys = JSON.parse(JSON.stringify(this._defaultShortkeys));
        this._settings = JSON.parse(JSON.stringify(this._defaultSettings));
    }


    get shortkeys() {
        return JSON.parse(JSON.stringify(this._shortkeys));
    }


    get settings() {
        return JSON.parse(JSON.stringify(this._settings));
    }
}
