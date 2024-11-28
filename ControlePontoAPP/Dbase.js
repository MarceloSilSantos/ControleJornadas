import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('timedatabase.db');

export const init = () => {
  return new Promise((resolve, reject) => {
    db.isInTransactionSync(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS jornada (
          id INTEGER PRIMARY KEY NOT NULL,
          entrada TEXT,
          almoco_saida TEXT,
          almoco_retorno TEXT,
          saida TEXT
        );`,
        [],
        () => resolve(),
        (_, err) => reject(err)
      );
    });
  });
};

export const insertJornada = (entrada, almocoSaida, almocoRetorno, saida) => {
  return new Promise((resolve, reject) => {
    db.isInTransactionSync(tx => {
      tx.executeSql(
        `INSERT INTO jornada (entrada, almoco_saida, almoco_retorno, saida)
         VALUES (?, ?, ?, ?)`,
        [entrada, almocoSaida, almocoRetorno, saida],
        (_, result) => resolve(result),
        (_, err) => reject(err)
      );
    });
  });
};

export const fetchJornada = () => {
  return new Promise((resolve, reject) => {
    db.isInTransactionSync(tx => {
      tx.executeSql(
        'SELECT * FROM jornada',
        [],
        (_, result) => resolve(result.rows._array),
        (_, err) => reject(err)
      );
    });
  });
};
