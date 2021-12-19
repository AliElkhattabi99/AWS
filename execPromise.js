const { exec } = require("child_process");

const execPromise = async (command) => {
  console.log(command);
  return new Promise((resolve, reject) => {
    const ls = exec(command, function (error, stdout, stderr) {
      if (error) {
        console.error("Error: ", error);
        reject(error);
      }
      if (stdout) console.log("stdout: ", stdout);
      if (stderr) console.error("stderr: ", stderr);
    });

    ls.on("exit", (code) => {
      console.log("execPromise finished with code ", code);
      resolve();
    });
  });
};

module.exports = execPromise;
