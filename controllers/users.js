const asyncHandler = require("express-async-handler");
const { ObjectId } = require("mongodb");
const { User } = require("../models/users");

//get all users (admin only)
exports.getAll = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const queryCount = await User.countDocuments();
    const searchResult = await User.find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: 1 });
    res.status(200).send({count: queryCount, result: searchResult});
});

//get user by id
exports.getById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const searchResult = await User.findById(id)
    res.status(200).send(searchResult);
});

//add / remove user from admins
exports.changeAdmin = asyncHandler(async (req, res) => {
    const { id, adminValue } = req.body;

    if (adminValue === undefined) {
        return res.status(400).send("adminValue Required");
    }
    if (typeof adminValue !== "boolean") {
        return res.status(400).send("adminValue Should Be Boolean");
    }
    if (id === undefined) {
        return res.status(400).send("id Required");
    }
    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Invalid Id");
    }
    

    const user = await User.findById(id);
    user.admin = adminValue;
    const updatedUser = await user.save()
    res.status(200).send(updatedUser);
});

//update user by id
exports.update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, phone, password, bio } = req.body;
    const userDoc = await User.findById(id);
    if (!userDoc) {
        return res.status(400).send("User does not exist");
    }
    const userExists = await User.findOne({ email })
    if (userExists) {
        return res.status(400).send("Email already in use");
    }
    if (firstName) {userDoc.firstName = firstName}
    if (lastName) {userDoc.lastName = lastName}
    if (email) {userDoc.email = email}
    if (phone) {userDoc.phone = phone}
    if (password) {userDoc.password = password}
    if (bio) {userDoc.bio = bio}

    //bio can be an empty field, so if null set to empty string
    if (bio === null) {userDoc.bio = ""}

    const updatedUser = await userDoc.save()
    res.status(200).send(updatedUser);
});