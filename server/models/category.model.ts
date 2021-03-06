import * as mongoose from 'mongoose';
import * as diacritics from 'diacritics';

export interface ICategory {
    id?: string;
    name: string;
    lowercaseName?: string;
    active: boolean;
}

export interface ICategoryModel extends ICategory, mongoose.Document { }

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        lowercaseName: {
            type: String,
        },
        active: {
            type: Boolean,
            default: true,
            required: true
        }
    },
    {
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true
        }
    }
);

// Duplicate the ID field.
categorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

categorySchema.pre('save', function(next){
    this.lowercaseName = diacritics.remove(this.name.toLowerCase());
    next();
});

export const CategoryModel = mongoose.model<ICategoryModel>('category', categorySchema);
