const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


class db {
  constructor(){
    this.db_url = `https://blaster2d-database.ruiwenge2.repl.co/${process.env["db_key"]}`;
  }

  async get(key){
    return await fetch(`${this.db_url}/${key}`)
      .then(e => e.text())
      .then(str => {
        let value = str;
        try {
          value = JSON.parse(str);
        } catch(err){
          
        }
        if(!value) return null;
        return value;
      });
  }

  async set(key, value){
    const strValue = JSON.stringify(value);

    await fetch(`${this.db_url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: key, value: strValue })
    });
    
    return this;
  }

  async delete(key){
    await fetch(`${this.db_url}/${key}`, { method: "DELETE" });
    return this;
  }
}

module.exports = db;