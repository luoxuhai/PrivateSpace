import request from '@/utils/request';

class PurchaseController {
  public async pay() {
    return request.post('/api/v1/app_store/notification');
  }
}

export default new PurchaseController();
