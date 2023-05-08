const fs = require('fs/promises');

function formatUsers (users, company) {
  let output = ``;
  users.forEach(user => {
    output += `\t\t${user.last_name}, ${user.first_name}, ${user.email}\n`;
    output += `\t\t  Previous Token Balance, ${user.tokens}\n`;
    output += `\t\t  New Token Balance ${user.active_status === true ? user.tokens + company.top_up : user.tokens}\n`;
  });

  return output;
}

async function processFiles () {
  try {
    let users = await fs.readFile('./users.json');
    users = JSON.parse(users);
    users = users.sort((userA, userB) => {
      if (userA.last_name < userB.last_name) {
        return -1;
      } else if (userA.last_name > userB.last_name) {
        return 1;
      } else {
        return 0;
      }
    });

    let companies = await fs.readFile('./companies.json');
    companies = JSON.parse(companies);
    companies.sort((companyA, companyB) => {
      if (companyA.id < companyB.id) {
        return -1;
      } else if (companyA.id > companyB.id) {
        return 1;
      } else {
        return 0;
      }
    });

    let outputString = '';
    companies.forEach(company => {
      const companyUsers = users.filter(user => user.company_id === company.id);
      const activeUsers = companyUsers.filter(user => user.active_status === true);

      let emailedUsers = null;
      let nonEmailedUsers = null;
      if (company.email_status === false) {
        emailedUsers = [];
        nonEmailedUsers = companyUsers;
      } else {
        emailedUsers = companyUsers.filter(user => user.email_status === true);
        nonEmailedUsers = companyUsers.filter(user => user.email_status === false);
      }

      outputString += `\n\tCompany Id: ${company.id}\n`;
      outputString += `\tCompany Name: ${company.name}\n`;
      outputString += `\tUsers Emailed:\n`;
      outputString += `${formatUsers(emailedUsers, company)}`;
      outputString += `\tUsers Not Emailed:\n`;
      outputString += `${formatUsers(nonEmailedUsers, company)}`;
      outputString += `\t\tTotal amount of top ups for ${company.name}: ${activeUsers.length * company.top_up}\n`;
    });

    await fs.writeFile('output.txt', outputString);
  } catch (error) {
    console.log('Could not process files.')
  }
}

processFiles();
