import { Column, DataType, Table, Model, } from "sequelize-typescript";

@Table({tableName: 'profiles'})
export class Profile extends Model<Profile> {
    @Column({type: DataType.INTEGER, unique: true, primaryKey: true, })
    id: number;

    @Column( {type: DataType.STRING, } )
    firstname: string;

    @Column( {type: DataType.STRING, } )
    middlename: string;
    
    @Column( {type: DataType.STRING, } )
    lastname: string;

    @Column( {type: DataType.STRING, } )
    phoneNumber: string;
    
    @Column( {type: DataType.TEXT, } )
    about: string;
}
