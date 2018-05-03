import {Configuration, findRule} from "~tslint";

const configPath = require.resolve("./tslint.json");
const config = Configuration.readConfigurationFile(configPath);
config.jsRules = jsOnly(config.jsRules || {}, config.rules);
export = config;

function jsOnly<T extends object>(target: T, source: T): T {
    for (const key in source)
        if (source.hasOwnProperty(key)) {

            // do not override explicitly defined js rules
            if (target[key])
                continue;

            // check rule exists
            const rule = findRule(key);
            if (rule === undefined)
                throw new Error(`Couldn't find rule '${key}'.`);

            // skip typescript rules
            if (rule.metadata.typescriptOnly)
                continue;

            target[key] = source[key];
        }
    return target;
}
