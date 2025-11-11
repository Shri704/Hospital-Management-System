export default class ApiResponse {
  constructor({ statusCode = 200, message = "OK", data = null, meta = null }) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }
}
