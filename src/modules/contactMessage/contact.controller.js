const { ApiError } = require("@/shared/utils/apiError.utils");
const ApiResponse = require("@/shared/utils/apiResponse.utils");
const asyncHandler = require("@/shared/utils/asyncHandeler.utils");
const { HTTP_STATUS } = require("@/shared/config/constant.config");

class ContactMessageController {
  constructor() {
    this.service = require("@/modules/contactMessage/contact.service");
  }

  createContact = asyncHandler(async (req, res) => {
    const { name, email, phoneNumber, message } = req.body;
    const contact = await this.service.createContact({
      name,
      email,
      phoneNumber,
      message,
    });
    ApiResponse.success(res, HTTP_STATUS.CREATED, "Contact created", contact);
  });

  getContact = asyncHandler(async (req, res) => {
    let query = {};
    if (req.query.phoneNumber) {
      query.phoneNumber = req.query.phoneNumber;
    } else {
      query = {};
    }
    const contact = await this.service.getContact(query);
    ApiResponse.success(res, HTTP_STATUS.OK, "Contact fetched", contact);
  });

  deleteContact = asyncHandler(async (req, res) => {
    const contact = await this.service.deleteContact(req.params.phoneNumber);
    ApiResponse.success(res, HTTP_STATUS.OK, "Contact deleted", contact);
  });
}

module.exports = new ContactMessageController();
