// components/OnboardingModal.js
import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";

export default function OnboardingModal({ onClose }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setShow(false);
      onClose();
    }, 15000);
    return () => clearTimeout(t);
  }, [onClose]);

  const handleClose = () => {
    setShow(false);
    onClose();
  };

  return (
    <Modal isOpen={show} onClose={handleClose} isCentered>
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent
        bg="whiteAlpha.100"
        backdropFilter="blur(10px)"
        border="1px solid"
        borderColor="border"
        rounded="xl"
        p={6}
      >
        <ModalHeader textAlign="center" color="primaryTxt">
          Welcome!
        </ModalHeader>
        <ModalBody color="primaryTxt">
          <UnorderedList spacing={2}>
            <ListItem>Upload PNG, JPG or SVG designs.</ListItem>
            <ListItem>Click “Convert” to generate PES files.</ListItem>
            <ListItem>Watch real-time status badges.</ListItem>
            <ListItem>Filter and page through your uploads.</ListItem>
            <ListItem>Preview your stitches and review activity.</ListItem>
          </UnorderedList>
        </ModalBody>
        <ModalFooter justifyContent="center">
          <Button variant="primary" onClick={handleClose}>
            Got it!
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}