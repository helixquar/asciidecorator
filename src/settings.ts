import * as vscode from 'vscode';
import workspace = vscode.workspace;

abstract class BaseSettings {
    protected readSetting<T>(name: string, defaultValue:T): T {
        let configuration = workspace.getConfiguration();
        let value = configuration.get<T>(name, undefined);

        // If user specified a value, use it
        if (value !== undefined && value !== null) {
            return value;
        }
        return defaultValue;
    }
}

export class Settings extends BaseSettings {
    private _enabled: boolean;
    private _defaultFont: string;

    constructor() {
        super();

        this._enabled = this.readSetting<boolean>("asciidecorator.enabled", true);
        this._defaultFont = this.readSetting<string>("asciidecorator.defaultFont", "ANSI Shadow");
    }

    public get Enabled(): boolean {
        return this._enabled;
    }

    public get DefaultFont(): string {
        return this._defaultFont;
    }
}