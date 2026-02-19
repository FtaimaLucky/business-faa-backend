const { ApiError } = require("@/shared/utils/apiError.utils");
const { HTTP_STATUS } = require("@/shared/config/constant.config");
const contactMessageModel = require("@/modules/contactMessage/contact.model");

class ContactMessageService {
  createContact = async (data) => {
    const contact = await contactMessageModel.create(data);
    if (!contact) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Contact not created");
    }
    return contact;
  };
}

module.exports = new ContactMessageService();
