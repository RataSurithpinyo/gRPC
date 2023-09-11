const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
mongoose.connect(
  "mongodb+srv://sa_restaurant:YcQQ2VLFvGVnyQAH@restaurant.a5onddo.mongodb.net/"
);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("MongoDB is connected."));
const MenuItem = require("./models/menu");

const PROTO_PATH = "./restaurant.proto";

var grpc = require("grpc");
var protoLoader = require("@grpc/proto-loader");

var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});

var restaurantProto = grpc.loadPackageDefinition(packageDefinition);

const { v4: uuidv4 } = require("uuid");
const async = require("hbs/lib/async");

const server = new grpc.Server();

server.addService(restaurantProto.RestaurantService.service, {
  getAllMenu: async (_, callback) => {
    try {
        let menuItems = await MenuItem.find();
        callback(null, { menuItems });
    } catch (err) {
        console.error(err);
        callback({
            code: grpc.status.NOT_FOUND,
            details: "Error fetching from MongoDB"
        });
    }
  },
  get: async (call, callback) => {
    try {
      const menuItem = await MenuItem.findById(call.request.id);
      if (!menuItem) {
        callback({
          code: grpc.status.INTERNAL,
          details: "Menu Not Found",
        });
      } else {
        callback(null, menuItem);
      }
    } catch (err) {
      console.error(err);
      callback({
        code: grpc.status.INTERNAL,
        details: "Error fetching from MongoDB",
      });
    }
  },
  insert: async (call, callback) => {
    try {
      const menuItem = new MenuItem(call.request);
      menuItem.id = uuidv4();
      const savedItem = await menuItem.save();
      callback(null, savedItem);
    } catch (err) {
      console.error(err);
      callback({
        code: grpc.status.INTERNAL,
        details: "Error fetching from MongoDB",
      });
    }
  },
  update: async (call, callback) => {
    try {
      const updatedMenuItem = call.request;
      const updatedItem = await MenuItem.findByIdAndUpdate(
        call.request.id,
        updatedMenuItem,
        { new: true }
      );
      if (!updatedItem) {
        callback({
          code: grpc.status.INTERNAL,
          details: "Menu Not Found",
        });
      } else {
        callback(null, updatedItem);
      }
    } catch (err) {
      console.error(err);
      callback({
        code: grpc.status.INTERNAL,
        details: "Error fetching from MongoDB",
      });
    }
  },
  remove: async (call, callback) => {
    try {
      const menuItem = await MenuItem.findByIdAndDelete(call.request.id);
      if (!menuItem) {
        callback({
          code: grpc.status.INTERNAL,
          details: "Menu Not Found",
        });
      } else {
        callback(null, {});
      }
    } catch (err) {
      console.error(err);
      callback({
        code: grpc.status.INTERNAL,
        details: "Error fetching from MongoDB",
      });
    }
  },
});

server.bind("127.0.0.1:30043", grpc.ServerCredentials.createInsecure());
console.log("Server running at http://127.0.0.1:30043");
server.start();
