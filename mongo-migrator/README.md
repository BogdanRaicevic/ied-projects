first run create mysql database
in terminal run
`mysql -u root -p`
then in `mysql>` create db with
`CREATE DATABASE IF NOT EXISTS ied2;`

then you can write `source <path-to-mysql-file>`
for example `source /home/bogdanraicevic/downloads/ied-data2.sql`
thats it you create dbs

To backup the mongo database run
`mongodump --db ied -o "specify folder here"`

To restore the mongo database run (FOR MACOS) `mongorestore --db ied ~/Downloads/ied`

To restore a gz file run `mongorestore --uri="$MONGO_URI" --archive=/path/to/backup-2025-02-08.gz --gzip`  
