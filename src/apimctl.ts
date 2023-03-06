const fs = require('fs');
// import path from 'path';
const figlet = require("figlet");
const inquirer = require('inquirer');
const Docker = require('dockerode');
const docker = new Docker({socketPath: '/var/run/docker.sock'});
const { Command } = require("commander");
const program = new Command();
const dockerComposeFile = 'docker-compose.yml';

const { elasticSearch, mongodb } = require('./services');
import {ComposeSpecification, DockerComposeFile} from './compose-interface'
import YAML from 'yaml'

program
.version("1.0.0")
.description("Start your custom APIM environment")
.option("-l, --ls  [value]", "List running versions of APIM")
.option("-s, --start <value>", "Start a specific version of APIM")
.option("-x, --stop <value>", "Stop a specific version of APIM")
.option("-d, --db <value>", "Database [default: 'MongoDB']")
.parse(process.argv);

const options = program.opts()
console.log(figlet.textSync("APIM CTL"));

function createFile(filename: string, content: string) {
  try {
    fs.writeFileSync(filename, content);
  } catch (err) {
    console.error(`Error creating file '${filename}': ${err}`);
  }
}

const header = `
#
# Copyright (C) 2015 The Gravitee team (http://gravitee.io)
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#\n\n`;


function buildDockerComposeFile(dockerComposeVersion = '3.8', database = 'mongodb') {
  const jsonDockerCompose: ComposeSpecification = {
    version: '3.8',
    volumes: {
      ...mongodb.volumes,
      ...elasticSearch.volumes
    },
    networks: {
      ...mongodb.networks,
      ...elasticSearch.networks
    },
    services: {
      database: mongodb.services,
      elasticsearch: elasticSearch.services
    }
  };


  // jsonDockerCompose.services = {};
  // jsonDockerCompose.services.database = mongodb.services;
  // jsonDockerCompose.services.elasticsearch = elasticSearch.services;

  // jsonDockerCompose.volumes = {};
  // jsonDockerCompose.volumes = mongodb.networks; 
  // jsonDockerCompose.volumes = {...jsonDockerCompose.volumes, ...elasticSearch.volumes}

  // createFile(dockerComposeFile, JSON.stringify(jsonDockerCompose));
  createFile(dockerComposeFile, YAML.stringify(jsonDockerCompose));
}

inquirer
  .prompt([
    {
        name: 'version',
        message: "Which APIM version you want to install?",
        type: "list",
        choices: ['3.16', '3.17', '3.18', '3.19', '3.20']
    },
    {
        name: 'edition',
        message: 'Which edition',
        type: 'list',
        choices: ['Community Edition', 'Enterprise Edition']
    },
    {
        name: 'options',
        message: 'Any extra options',
        type: 'checkbox',
        choices: ['option1', 'option2', 'option3', 'option4', 'option5']
    },
    {
        name: 'finish',
        message: 'Ok, done! What do you want to do now',
        type: 'list',
        choices: ['Start environment now', 'Generate a docker-compose.yml file']
    }
  ])
  .then((answers:any) => {
    if(answers.finish === 'Start environment now') {
        console.log(`\n\nVersion ${answers.version} (${answers.edition}) and the following options: \n - ${answers.options.join('\n - ')} \n ... will be installed now`);
    } else {
        console.log(`\n\nA docker-compose file ('${dockerComposeFile}') for Version ${answers.version} (${answers.edition}) was generated.\n\n`);
        buildDockerComposeFile();
        const fileContent = fs.readFileSync(dockerComposeFile, 'utf-8');
    }
  })
  .catch((error:any) => {
    if (error.isTtyError) {
      console.log("Prompt couldn't be rendered in the current environment");
    } else {
      console.log("Something else went wrong");
    }
  });
