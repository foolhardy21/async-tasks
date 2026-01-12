import path from "path"
import { DataTypes, FindOptions, Sequelize, UpdateOptions, WhereOptions } from "sequelize"
import { INVENTORY_STATUS, PAYMENT_STATUS } from "../utils/common"

class Database {
    #sequelize
    #User
    #OrderServices

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
                timestamps: true,
            },
        )
        this.#OrderServices = this.#sequelize.define(
            "OrderServices",
            {
                orderId: {
                    type: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                paymentStatus: {
                    type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS)),
                    allowNull: true,
                },
                inventoryStatus: {
                    type: DataTypes.ENUM(...Object.values(INVENTORY_STATUS)),
                    allowNull: true,
                },
                expiresAt: {
                    type: DataTypes.DATE,
                    allowNull: true,
                }
            },
            {
                tableName: "order_services",
                underscored: true,
                timestamps: true,
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

    async create({ uploadedImage, thumbnailImage }: { uploadedImage: string, thumbnailImage: string }) {
        try {
            const userModel = await this.#User.create({
                ...(uploadedImage && { uploadedImage }),
                ...(thumbnailImage && { thumbnailImage }),
            })
            return userModel.toJSON()
        } catch (err) {
            console.log(err)
        }
    }

    async update(columns: Record<string, unknown>, options: { where: WhereOptions } & Partial<UpdateOptions>) {
        try {
            await this.#User.update(columns, options)
        } catch (err) {
            console.log(err)
        }
    }

    async getOrderService({ where, options }: { where: WhereOptions, options: FindOptions }) {
        try {
            const orderModels = await this.#OrderServices.findAll({
                ...(where && { where }),
                ...(options && options),
            })
            return orderModels.map(orderModel => orderModel.toJSON())
        } catch (err) {
            console.log(err)
            throw err as Error
        }
    }

    async createOrderService({ orderId, paymentStatus, inventoryStatus, expiresAt }: { orderId: string, paymentStatus: string, inventoryStatus: string, expiresAt: Date }) {
        try {
            const orderModel = await this.#OrderServices.create({
                ...(orderId && { orderId }),
                ...(paymentStatus && { paymentStatus }),
                ...(inventoryStatus && { inventoryStatus }),
                ...(expiresAt && { expiresAt }),
            })
            return orderModel.toJSON()
        } catch (err) {
            console.log(err)
        }
    }

    async updateOrderService(columns: Record<string, unknown>, options: { where: WhereOptions } & Partial<UpdateOptions>) {
        try {
            await this.#OrderServices.update(columns, options)
        } catch (err) {
            console.log(err)
        }
    }
}

const dbInstance = new Database()
dbInstance.init()

export default dbInstance