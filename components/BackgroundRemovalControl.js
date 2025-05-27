import { Flex, Checkbox, Stack, Box, Input } from "@chakra-ui/react";

export default function BackgroundRemovalControl({
  removeBg,
  setRemoveBg,
  bgThreshold,
  setBgThreshold,
}) {
  return (
    <Flex mb={6} align="center" gap={4}>
      <Checkbox
        isChecked={removeBg}
        onChange={(e) => setRemoveBg(e.target.checked)}
        colorScheme="accent"
      >
        Strip white background
      </Checkbox>
      <Stack direction="row" align="center" spacing={2}>
        <Box>Threshold:</Box>
        <Input
          type="number"
          w="16"
          value={bgThreshold}
          onChange={(e) => setBgThreshold(Number(e.target.value))}
        />
      </Stack>
    </Flex>
  );
}