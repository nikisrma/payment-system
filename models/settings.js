const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Settings = new Schema(
	{
		payment_mode: { type: Number, default: 0 },
		public_key_test: { type: String },
		private_key_test: { type: String },
		payment_options:{ type: Array, default: [] },
	});

module.exports = mongoose.model("Settings", Settings);