const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));

class db {
  constructor(){
    this.db_url = process.env["db_url"];
  }

  async get(key){
    return await fetch(`${this.db_url}/${key}`)
      .then(e => e.text())
      .then(str => {
        let value = str;
        try {
          value = JSON.parse(str);
        } catch(err){
          console.log(err)
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

  async player(name, data){
    data = JSON.stringify(data);
    await fetch(`${this.db_url}/player`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, data })
    });
    return this;
  }

  async score(name){
    await fetch(`${this.db_url}/player/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "name": name })
    });
    return this;
  }
}

module.exports = db;