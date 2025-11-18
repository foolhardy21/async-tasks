import path from "path"
import { DataTypes, FindOptions, Sequelize, UpdateOptions, WhereOptions } from "sequelize"

class Database {
    #sequelize
    #User

    constructor() {
        this.#sequelize = new Sequelize({
            dialect: "sqlite",
            storage: path.resolve(__dirname, "../../sync_async_db.sqlite")
        })
        this.#User = this.#sequelize.define(
            "User",
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                uploadedImage: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                thumbnailImage: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
            },
            {
                tableName: "users",
                underscored: true,
                timestamps: false,
            },
        )
    }

    async init() {
        try {
            await this.#sequelize.authenticate()
        } catch (err) {
            console.log(err)
        }
    }

    async get({ where, options }: { where: WhereOptions, options: FindOptions }) {
        try {
            const userModels = await this.#User.findAll({
                ...(where && { where }),
                ...(options && options),
            })
            return userModels.map(userModel => userModel.toJSON())
        } catch (err) {
            console.log(err)
            throw err as Error
        }
    }

    async update(columns: Record<string, unknown>, options: { where: WhereOptions } & Partial<UpdateOptions>) {
        try {
            await this.#User.update(columns, options)
        } catch (err) {
            console.log(err)
        }
    }

}

const dbInstance = new Database()
dbInstance.init()

export default dbInstance