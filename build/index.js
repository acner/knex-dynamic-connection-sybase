"use strict";
/*
* knex-dynamic-connection
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("knex/lib/helpers");
/**
 * Dialects with their `acquireRawConnection` implementation
 */
const dialects = {
    mssql: 'mssql',
    mysql: 'mysql',
    mysql2: 'mysql',
    oracle: 'oracle',
    oracledb: 'oracledb',
    postgres: 'pg',
    redshift: 'redshift',
    sybase: 'sybase',
};
/**
 * Patches the knex client so that it makes use of a resolver function to
 * resolve the config before making a SQL query.
 */
function patchKnex(knex, configFn) {
    const client = knex.client;
    const clientName = helpers_1.resolveClientNameWithAliases(client.config.client);
    /**
     * Do not patch for sqlite3
     */
    if (clientName === 'sqlite3') {
        return;
    }
    /**
     * This function is the exact copy of acquire connection from the knex code
     * base, with just handful of following changes.
     *
     * 1. Using `new Promise` vs `Bluebird.try`.
     * 2. Use `client.getRuntimeConnectionSettings` vs `client.connectionSettings`
     *    to get a new connection host for read replicas.
     */
    client.acquireRawConnection = require(`./src/dialects/${dialects[clientName]}`).acquireRawConnection;
    /**
     * Returns a dynamic connection to be used for each query
     */
    client.getRuntimeConnectionSettings = function getRuntimeConnectionSettings() {
        return configFn(this.config);
    };
}
exports.patchKnex = patchKnex;
