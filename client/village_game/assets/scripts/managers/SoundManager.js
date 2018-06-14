cc.Class({
    extends: cc.Component,
    properties: {
        soundEnabled: true,
        bgmVolume: 0.8,
        SEVolume: 0.8,
        _currentBgmAudioId: -1,
        _currentBgmVolume: 0.0,
        _waitingPlayBgm: null,
        _fadeSign: 1,
        _fadeSpeed: 0.05,
        _fading: false,
        _schedule: null,
    },
    playBgmMusic: function (filePath) {
        this._waitingPlayBgm = null;
        if (this.soundEnabled) {
            this._clearFade();
            let self = this;
            if (this._currentBgmAudioId >= 0) {
                this._waitingPlayBgm = filePath;
                this._fadeOut();
            } else {
                this._fadeIn(filePath);
            }
        }
    },
    _fadeOut: function () {
        this._fadeSpeed = 0.1;
        this._fadeSign = -1;
        this._fading = true;
        this._schedule = cc.director.getScheduler();
        this._schedule.scheduleCallbackForTarget(this, this._fadeBgmVolume, 0.2, cc.macro.REPEAT_FOREVER, 0, false);
    },
    _fadeIn: function (filePath) {
        this._fadeSpeed = 0.05;
        this._currentBgmVolume = 0.0;
        this._currentBgmAudioId = cc.audioEngine.play(filePath, true, this._currentBgmVolume);
        this._fadeSign = 1;
        this._fading = true;
        this._schedule = cc.director.getScheduler();
        this._schedule.scheduleCallbackForTarget(this, this._fadeBgmVolume, 0.2, cc.macro.REPEAT_FOREVER, 0, false);
    },
    _fadeBgmVolume: function () {
        this._currentBgmVolume += this._fadeSign * this._fadeSpeed;
        if (this._fadeSign > 0) {
            if (this._currentBgmVolume >= this.bgmVolume) {
                this._currentBgmVolume = this.bgmVolume;
                this._schedule.unscheduleCallbackForTarget(this, this._fadeBgmVolume);
                this._fading = false;
            }
        } else {
            if (this._currentBgmVolume <= 0) {
                this._currentBgmVolume = 0;
                this._schedule.unscheduleCallbackForTarget(this, this._fadeBgmVolume);
                this._fading = false;
            }
        }
        cc.audioEngine.setVolume(this._currentBgmAudioId, this._currentBgmVolume);
        if (!this._fading && this._fadeSign < 0) {
            this.stopBgmMusic();
            if (this._waitingPlayBgm) {
                this._fadeIn(this._waitingPlayBgm);
                this._waitingPlayBgm = null;
            }
        }
    },
    _clearFade: function () {
        if (this._fading) {
            this._fading = false;
            this._schedule.unscheduleCallbackForTarget(this, this._fadeBgmVolume);
        }
    },
    fadeOutBgmMusic: function () {
        if (this._currentBgmAudioId >= 0) {
            this._clearFade();
            this._fadeOut();
        }
    },
    stopBgmMusic: function () {
        if (this._currentBgmAudioId >= 0) {
            cc.audioEngine.stop(this._currentBgmAudioId);
            this._currentBgmAudioId = -1;
        }
    },
    playSEMusic: function (filePath) {
        if (this.soundEnabled) {
            cc.audioEngine.play(filePath, false, this.SEVolume);
        }
    },
    stopAllMusic: function () {
        this._waitingPlayBgm = null;
        this._clearFade();
        cc.audioEngine.stopAll();
        this._currentBgmAudioId = -1;
    }
});
