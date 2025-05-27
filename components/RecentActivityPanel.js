import { Box, Heading, List, ListItem, Flex, Text, Badge } from "@chakra-ui/react";

export default function RecentActivityPanel({ uploadedFiles }) {
  if (!uploadedFiles || uploadedFiles.length === 0) return null;

  const recent = [...uploadedFiles]
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 5);

  const statusColorScheme = (status) => {
    switch (status) {
      case "Converted":
        return "green";
      case "Uploaded":
        return "blue";
      case "Converting":
        return "yellow";
      case "Error":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Box
      bg="whiteAlpha.100"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="rgba(255,255,255,0.2)"
      rounded="xl"
      p={6}
      mt={8}
      boxShadow="0 8px 32px rgba(0,0,0,0.18)"
    >
      <Heading size="md" mb={4} color="primaryTxt" fontWeight="bold">
        Recent Activity
      </Heading>
      <List spacing={4}>
        {recent.map((f) => (
          <ListItem key={f.url}>
            <Flex
              justify="space-between"
              align="center"
              bg="secondaryBg"
              p={4}
              rounded="lg"
              boxShadow="0 4px 12px rgba(255, 255, 255, 0.05)"
              _hover={{ bg: "whiteAlpha.200" }}
            >
              <Text
                color="primaryTxt"
                isTruncated
                maxW="70%"
                fontWeight="medium"
              >
                {f.name}
              </Text>
              <Badge
                colorScheme={statusColorScheme(f.status)}
                variant="solid"
                fontSize="0.75rem"
                px={3}
                py={1}
                rounded="full"
                userSelect="none"
              >
                {f.status}
              </Badge>
            </Flex>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}