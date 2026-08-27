const { Pool } = require('pg');

(async () => {
  const pool = new Pool({ connectionString: 'postgresql://postgres:ssds@localhost:5432/bharatseva' });
  try {
    const res = await pool.query(
      'UPDATE applications SET status=$1, remarks=$2, officer_id=$3 WHERE id=$4 RETURNING *',
      ['more_info', 'test request info', '2d7199f3-6602-4418-85aa-c1d347c7f060', 'dab2022f-10f1-48ff-98b0-b3c98e95e05a']
    );
    console.log(JSON.stringify(res.rows));
  } catch (err) {
    console.error(err.message);
    console.error(err.stack);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
