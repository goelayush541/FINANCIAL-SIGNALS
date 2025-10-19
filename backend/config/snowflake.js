const snowflake = require('snowflake-sdk');

class SnowflakeClient {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.connection = snowflake.createConnection({
        account: process.env.SNOWFLAKE_ACCOUNT,
        username: process.env.SNOWFLAKE_USERNAME,
        password: process.env.SNOWFLAKE_PASSWORD,
        warehouse: process.env.SNOWFLAKE_WAREHOUSE,
        database: process.env.SNOWFLAKE_DATABASE,
        schema: process.env.SNOWFLAKE_SCHEMA
      });

      await new Promise((resolve, reject) => {
        this.connection.connect((err, conn) => {
          if (err) {
            console.error('Snowflake connection error:', err);
            reject(err);
          } else {
            console.log('✅ Snowflake connected successfully');
            this.isConnected = true;
            resolve(conn);
          }
        });
      });
    } catch (error) {
      console.error('Failed to connect to Snowflake:', error);
      throw error;
    }
  }

  async executeQuery(query, params = []) {
    if (!this.isConnected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      this.connection.execute({
        sqlText: query,
        binds: params,
        complete: (err, stmt, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      });
    });
  }

  async analyzeSentiment(text) {
    const query = `
      SELECT SNOWFLAKE.CORTEX.SENTIMENT(?) as sentiment_score,
             CASE 
               WHEN sentiment_score > 0.1 THEN 'POSITIVE'
               WHEN sentiment_score < -0.1 THEN 'NEGATIVE'
               ELSE 'NEUTRAL'
             END as sentiment_label
    `;
    
    const result = await this.executeQuery(query, [text]);
    return result[0];
  }

  async extractEntities(text) {
    const query = `
      SELECT SNOWFLAKE.CORTEX.EXTRACT_ENTITIES(?) as entities
    `;
    
    const result = await this.executeQuery(query, [text]);
    return result[0];
  }
}

module.exports = new SnowflakeClient();