#!/usr/bin/env node

import axios from 'axios'
import http from 'http';
import { createHTML } from './Utils.mjs'

import chalk from 'chalk'
import cliSpinners from 'cli-spinners'
import ora from 'ora'

import optionator from 'optionator';
let optionatorLocal = optionator({
    options: [
        {
            option: 'help',
            type: 'Boolean',
            description: 'Generate help message'
        },
        {
            option: 'hostname',
            alias: 'h',
            type: 'String',
            description: 'Hostname of the server to be connected'
        },
        {
            option: 'clientId',
            alias: 'c',
            type: 'String',
            description: 'OCAPI client ID'
        },
        {
            option: 'clientPassword',
            alias: 'p',
            type: 'String',
            description: 'OCAPI client password'
        }]
})

let config = {};
const options = optionatorLocal.parse(process.argv);

if (options.help) {
    console.log(optionatorLocal.generateHelp());
    process.exit(0);
}
if (!options.hostname) {
    console.log(chalk.red(`Please provide --hostname argument`));
    process.exit(0);
} else {
    config.hostname = options.hostname;
}

config.clientId = options.clientId || 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
config.clientPassword = options.clientPassword || 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

console.log(`Credentials being used : ${JSON.stringify(config, null, 2)}`)




const spinner = new ora({ spinner: cliSpinners.simpleDotsScrolling });

let dataURL = `https://${config.hostname}/s/-/dw/data/v21_3/`;

function handeError(e, message) {

    if (!e.response) {
        spinner.fail(chalk.red(`Connection Error.Please try again. ${e.code}`));
    } else {
        spinner.fail(chalk.red(message.replace('<<placeholder>>', JSON.stringify(e.response.data, null, 2))));
    }
    process.exit(0)
}

async function generateOnePagePreferences() {


    //Authenticate
    spinner.start(chalk.yellow('Authenticating'));

    let buff = Buffer.from(`${config.clientId}:${config.clientPassword}`);
    let base64data = buff.toString('base64');
    let authResponse;
    try {
        authResponse = await axios({
            url: `https://account.demandware.com/dw/oauth2/access_token?grant_type=client_credentials`,
            method: 'POST',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${base64data}`,
            }
        });
    } catch (e) {
        handeError(e, `Authentication error : <<placeholder>>`)
    }
    let authToken = `${authResponse.data.token_type} ${authResponse.data.access_token}`;
    spinner.succeed(chalk.green('Authenticated'));



    // fetch all preferences group ids
    spinner.start(chalk.yellow('Fetching: SitePreferences Groups'));
    let getPreferenceGroupsIds;
    try {
        getPreferenceGroupsIds = await axios({
            url: `${dataURL}system_object_definitions/SitePreferences/attribute_groups?start=0&count=200&select=(data.(id))`,
            method: 'GET',
            timeout: 7000,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken,
            }
        });
    } catch (e) {
        handeError(e, `<<placeholder>>
        Please verify Open Commerce API Settings for resource /system_object_definitions/**`)
    }
    let preferenceGroupsIds = getPreferenceGroupsIds.data;
    preferenceGroupsIds = preferenceGroupsIds.data.map(preferenceGroupsId => preferenceGroupsId.id)
    spinner.succeed(chalk.green('Fetched: SitePreferences Groups'));



    spinner.stop();

    // get actual values
    spinner.start(chalk.yellow('Fetching: Preferences values for all Groups'));
    var allPromises = [];
    var finalResult = {};
    for (let i = 0; i < preferenceGroupsIds.length; i++) {
        allPromises.push(
            axios({
                url: encodeURI(`${dataURL}site_preferences/preference_groups/${preferenceGroupsIds[i]}/development/preference_search`),
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken,
                },
                timeout: 10000,
                data: {
                    "query": {
                        "term_query": {
                            "fields": ["id"],
                            "operator": "is_not_null"

                        }
                    },
                    "select": "(hits.(id,site_values,attribute_definition.(default_value.(value),value_type),display_name.(default)))",
                    "count": 200
                }
            }).then(res => {
                if (res.data) {
                    finalResult[preferenceGroupsIds[i]] = res.data;
                }

            }).catch((e) => {
                handeError(e, `<<placeholder>>
                Please verify Open Commerce API Settings for resource /site_preferences/**`)
            }));


    }

    var finalRes = await Promise.all(allPromises).then((values) => {
        return finalResult;
    })
    spinner.succeed(chalk.green('Fetched: Preferences values for all Groups'));
    spinner.start(chalk.yellow('Creating: One Page Preferences file'));
    const sortedResult = Object.keys(finalResult)
        .sort()
        .reduce((accumulator, key) => {
            accumulator[key] = finalResult[key];

            return accumulator;
        }, {});

    let fileLocation = createHTML(sortedResult, config.hostname);
    spinner.succeed(chalk.green(`Created: One Page Preferences file`));
    console.log(chalk.yellow(`File Location: ${fileLocation}`));
}

generateOnePagePreferences();