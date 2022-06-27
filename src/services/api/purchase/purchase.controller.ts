import request from '@/utils/request';

class PurchaseController {
  public async pay(params: PayParams) {
    return request.post('/api/v1/purchase/notification', params);
  }
}

export default new PurchaseController();
