const figlet = require("figlet");
const inquirer = require('inquirer');
const Docker = require('dockerode');
const docker = new Docker({socketPath: '/var/run/docker.sock'});
const { Command } = require("commander");
const program = new Command();

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
        choices: ['Install now', 'Generate a docker-compose.yml file']
    }
  ])
  .then((answers:any) => {
    if(answers.finish === 'Install now') {
        console.log(`\n\nVersion ${answers.version} (${answers.edition}) and the following options: \n - ${answers.options.join('\n - ')} \n ... will be installed now`);
    } else {
        console.log(`\n\nA docker-compose file for Version ${answers.version} (${answers.edition}) was generated.`);
    }
  })
  .catch((error:any) => {
    if (error.isTtyError) {
      console.log("Prompt couldn't be rendered in the current environment");
    } else {
      console.log("Something else went wrong");
    }
  });
