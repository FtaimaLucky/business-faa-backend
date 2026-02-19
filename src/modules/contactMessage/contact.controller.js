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
}

module.exports = new ContactMessageController();
