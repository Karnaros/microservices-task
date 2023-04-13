import { Roles } from "@app/common/roles.enum";
import { Column, DataType, Table, Model } from "sequelize-typescript";

@Table({tableName: 'users'})
export class User extends Model<User>{
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true, })
    id: number;

    @Column( {type: DataType.STRING, unique: true, allowNull: false, } )
    email: string;

    @Column( {type: DataType.STRING, allowNull: false, } )
    password: string;

    @Column( {type: DataType.ENUM(...Object.values(Roles)), defaultValue: Roles.USER, } )
    role: Roles;
}
