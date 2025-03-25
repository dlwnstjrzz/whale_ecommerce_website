import { FaArrowRight, FaSpinner, FaPlus, FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubscription } from "@/app/hooks/useSubscription";

export function ProductForm({
  productNames,
  imageUrls,
  isLoading,
  onProductNamesChange,
  onImageUrlsChange,
  onSubmit,
}) {
  const { subscription } = useSubscription();
  const tokenCost = 1; // 1회 사용 시 토큰 비용

  const handleAddProduct = () => {
    if (productNames.length < 5) {
      onProductNamesChange([...productNames, ""]);
      onImageUrlsChange([...imageUrls, ""]);
    }
  };

  const handleRemoveProduct = (index) => {
    const newProductNames = productNames.filter((_, i) => i !== index);
    const newImageUrls = imageUrls.filter((_, i) => i !== index);
    onProductNamesChange(newProductNames);
    onImageUrlsChange(newImageUrls);
  };

  const handleProductNameChange = (value, index) => {
    const newProductNames = [...productNames];
    newProductNames[index] = value;
    onProductNamesChange(newProductNames);
  };

  const handleImageUrlChange = (value, index) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    onImageUrlsChange(newImageUrls);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* 토큰 정보 표시 */}
      {subscription && subscription.status === "active" && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">현재 보유 토큰</p>
              <p className="text-lg font-bold text-primary">
                {subscription.tokens} 토큰
              </p>
            </div>
            <div className="border-l border-blue-200 pl-4">
              <p className="text-sm text-gray-600">사용 예정</p>
              <p className="text-lg font-bold text-blue-600">
                {tokenCost * productNames.length} 토큰
              </p>
            </div>
          </div>
          {subscription.tokens < tokenCost * productNames.length && (
            <div className="mt-2 text-sm text-red-600">
              토큰이 부족합니다. 충전 후 이용해주세요.
            </div>
          )}
        </div>
      )}

      {productNames.map((productName, index) => (
        <div
          key={index}
          className="space-y-5 p-4 bg-gray-50 rounded-lg relative"
        >
          <div className="absolute right-2 top-2">
            {productNames.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveProduct(index)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTrash className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <Label
              htmlFor={`productName-${index}`}
              className="text-sm font-medium text-gray-700"
            >
              현재 상품명 #{index + 1}
            </Label>
            <Input
              id={`productName-${index}`}
              type="text"
              value={productName}
              onChange={(e) => handleProductNameChange(e.target.value, index)}
              placeholder="예: 원형 라탄 빨래바구니 세탁물분리함"
              className="w-full rounded-lg border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            {index === 0 && (
              <p className="text-xs text-gray-500 flex items-start">
                <span className="inline-block bg-blue-50 text-primary text-xs font-medium px-2 py-0.5 rounded-full mr-2">
                  Tip
                </span>
                현재 판매 중인 제품명이나 경쟁사 제품명을 입력하면 더 좋은
                결과를 얻을 수 있습니다
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label
              htmlFor={`imageUrl-${index}`}
              className="text-sm font-medium text-gray-700"
            >
              상품 이미지 URL #{index + 1}
            </Label>
            <Input
              id={`imageUrl-${index}`}
              type="text"
              value={imageUrls[index]}
              onChange={(e) => handleImageUrlChange(e.target.value, index)}
              placeholder="https://example.com/product-image.jpg"
              className="w-full rounded-lg border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            {index === 0 && (
              <p className="text-xs text-gray-500 flex items-start">
                <span className="inline-block bg-blue-50 text-primary text-xs font-medium px-2 py-0.5 rounded-full mr-2">
                  Tip
                </span>
                제품 이미지를 분석하여 더 정확한 상품명을 제안해 드립니다
              </p>
            )}
          </div>
        </div>
      ))}

      {productNames.length < 5 && (
        <Button
          type="button"
          variant="outline"
          onClick={handleAddProduct}
          className="w-full mt-2"
        >
          <FaPlus className="mr-2 h-4 w-4" />
          상품 추가하기 ({productNames.length}/5)
        </Button>
      )}

      <Button
        type="submit"
        disabled={
          isLoading ||
          (subscription &&
            subscription.tokens < tokenCost * productNames.length) ||
          productNames.some((name) => !name.trim()) ||
          imageUrls.some((url) => !url.trim())
        }
        className="w-full mt-6 rounded-lg h-12 text-base font-medium shadow-sm"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <FaSpinner className="animate-spin mr-2" />
            <span>상품명 생성 중...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <span>{productNames.length}개 상품명 생성하기</span>
            <FaArrowRight className="ml-2" />
          </div>
        )}
      </Button>
    </form>
  );
}
