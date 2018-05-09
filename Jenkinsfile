#!groovy

node {

    stage('checkout') {
        checkout scm
    }

    stage('prepare') {
        env.NODE_ENV = 'staging'
        if (env.BRANCH_NAME == 'prod') {
            env = 'production'
        }
        def nodeVersion = readNodeVersion()
        def nodeHome = tool name: "Node ${nodeVersion}", type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
        env.PATH = "${nodeHome}/bin:${env.PATH}"
        sh "node -v"
        sh "npm -v"
    }

    stage('install dependencies') {
        sh "npm install"
    }

    stage('run tests') {
        sh "npm run jshint"
        def mongo_data_path = './mongo-data'
        sh "rm -rf ${mongo_data_path}"
        sh "mkdir ${mongo_data_path}"
        start_background_process("mongo", "mongod --dbpath=${mongo_data_path}")
        start_background_process("redis", "redis-server")

        try {
            sh "npm run mocha-html"
        } finally {
            publishHTML([
                reportDir: 'report',
                reportFiles: 'mochawesome.html',
                reportName: 'Tests report'])
            stop_background_process("mongo")
            stop_background_process("redis")
        }
    }

    stage('deploy') {
        if (env.NODE_ENV == 'staging') {
            echo "Deploying staging environment"
            if (env.BRANCH_NAME == 'jenkins') {
                return
            }
            sh "rm -rf .elasticbeanstalk/"
            sh "eb init kano-api-us --region us-west-1 -p node.js"
            sh "eb deploy kanoApiStaging-env --nohang"
        } else {
            if (env.BRANCH_NAME == 'jenkins') {
                return
            }
            parallel(
                'instances': {
                    echo "Releasing the EU environment"
                    sh "rm -rf .elasticbeanstalk/"
                    sh "eb init kano-web-api-eu --region eu-west-1 -p node.js"
                    sh "eb deploy kanoWebApiEu-env-2 --nohang"

                    echo "Releasing the US environment"
                    sh "rm -rf .elasticbeanstalk/"
                    sh "eb init kano-api-us --region us-west-1 -p node.js"
                    sh "eb deploy kanoApiUs-env-1 --nohang"

                    echo "Releasing the ASIA environment"
                    sh "rm -rf .elasticbeanstalk/"
                    sh "eb init kano-api-asia --region ap-southeast-1 -p node.js"
                    sh "eb deploy kanoApiAsia1-env --nohang"
                },
                'cron': {
                    echo "--- Deploying Cron Machines --- "
                    sshagent (['kano-web-api']) {
                        ['asia-prod', 'eu-prod', 'us-prod'].each {
                            def MACHINE = "kano-api-cron-${it}"
                            sh "ssh ${MACHINE} '~/projects/deploy.sh'"
                        }
                    }
                }
            )
        }
    }
}

def readNodeVersion () {
    def packageJsonString = readFile('./package.json')
    def packageJson = new groovy.json.JsonSlurper().parseText(packageJsonString)
    return packageJson.engines.node
}

def start_background_process (name, start_string) {
    def pid_file = "./${name}.pid"
    sh """
        ${start_string} &
        echo \$! > ${pid_file}
    """
}

def stop_background_process (name) {
    def pid_file = "./${name}.pid"
    sh """
        kill -9 `cat ${pid_file}`
        rm ${pid_file}
    """
}
