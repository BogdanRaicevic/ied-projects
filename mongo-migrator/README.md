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

mongorestore --uri="$MONGO_URI" --archive=backup-2025-02-08.gz --gzip

Example when executing from folder where backup is located => `mongorestore --uri="mongodb://localhost:27017/ied" --archive=backup-2025-08-23.gz --gzip`