import mongoose from "mongoose";

/**
 * Common fields shared across multiple models
 * You can import & spread into other schemas
 */
export const baseFields = {
  isDeleted: {
    type: Boolean,
    default: false,
  },
};

export const baseOptions = {
  timestamps: true, // createdAt, updatedAt
};

/**
 * Helper to apply soft-delete behavior
 */
export const applySoftDelete = (schema) => {
  // Filter out deleted docs by default
  schema.pre(/^find/, function (next) {
    if (!this.getFilter().includeDeleted) {
      this.setQuery({ ...this.getQuery(), isDeleted: false });
    }
    next();
  });

  // Soft delete function
  schema.statics.softDelete = async function (id) {
    return this.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  };
};

/**
 * Helper for text search indexes in models
 */
export const applyTextIndex = (schema, fields) => {
  schema.index(fields);
};

/**
 * Example for inheritance
 * const mySchema = new mongoose.Schema({
 *   ...baseFields,
 *   name: String
 * }, baseOptions);
 *
 * applySoftDelete(mySchema);
 */
