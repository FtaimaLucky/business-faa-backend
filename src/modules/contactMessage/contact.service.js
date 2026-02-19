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
  getContact = async (query) => {
    const contact = (await contactMessageModel.find(query)).sort({
      createdAt: -1,
    });
    if (!contact) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Contact not found");
    }
    return contact;
  };
  deleteContact = async (phoneNumber) => {
    const contact = await contactMessageModel.findOneAndDelete({
      phoneNumber: phoneNumber,
    });
    if (!contact) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Contact not found");
    }
    return contact;
  };
}

module.exports = new ContactMessageService();
