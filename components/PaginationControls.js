import { useEffect } from "react";
import { Flex, Button, Text } from "@chakra-ui/react";

export default function PaginationControls({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages < 2) return null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  return (
    <Flex
      justify="center"
      align="center"
      gap={4}
      my={6}
      bg="whiteAlpha.100"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="rgba(255,255,255,0.2)"
      rounded="xl"
      boxShadow="0 8px 32px rgba(0,0,0,0.18)"
      px={6}
      py={3}
      userSelect="none"
    >
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        isDisabled={currentPage === 1}
        variant="outline"
        colorScheme="accent"
        size="sm"
      >
        Previous
      </Button>
      <Text color="primaryTxt" fontWeight="semibold" fontSize="sm" userSelect="text">
        Page {currentPage} of {totalPages}
      </Text>
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        isDisabled={currentPage === totalPages}
        variant="outline"
        colorScheme="accent"
        size="sm"
      >
        Next
      </Button>
    </Flex>
  );
}