/**
 * Converts an XML document or node to a JavaScript object
 * @param {Node} xml - The XML document or node to convert
 * @param {Object} options - Conversion options
 * @returns {Object} - The resulting JavaScript object
 */
function xmlToJson(xml, options = {}) {
  // Define default options
  const defaults = {
    attributePrefix: "@_",
    textNodeName: "#text",
    cdataNodeName: "#cdata",
    ignoreAttributes: false,
    ignoreNamespaces: true,
    parseNumbers: true,
    parseBooleans: true,
    trimText: true,
    removeXmlDeclaration: true,
    removeEmptyNodes: true,
    simplifyTextNodes: true,
    simplifyCdataNodes: true, // New option to control CDATA simplification
  };

  // Merge options with defaults
  const opts = { ...defaults, ...options };

  // Function to parse values (strings, numbers, booleans)
  const parseValue = (text) => {
    if (!text) return "";

    let value = opts.trimText ? text.trim() : text;

    if (opts.parseNumbers && !isNaN(value) && value.trim() !== "") {
      value = value % 1 === 0 ? parseInt(value, 10) : parseFloat(value);
    } else if (
      opts.parseBooleans &&
      (value.toLowerCase() === "true" || value.toLowerCase() === "false")
    ) {
      value = value.toLowerCase() === "true";
    }

    return value;
  };

  // Function to simplify objects that only contain a text or CDATA node
  const simplifyResult = (obj) => {
    if (!obj || typeof obj !== "object") return obj;

    // If the object has only one property
    if (Object.keys(obj).length === 1) {
      // Check for text node
      if (opts.simplifyTextNodes && opts.textNodeName in obj) {
        return obj[opts.textNodeName];
      }

      // Check for CDATA node
      if (opts.simplifyCdataNodes && opts.cdataNodeName in obj) {
        return obj[opts.cdataNodeName];
      }
    }

    // Otherwise return the original object
    return obj;
  };

  // Function to convert a single node
  const processNode = (node) => {
    // Different node types
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.nodeValue;
      if (opts.trimText) text = text.trim();
      return text ? text : null;
    }

    if (node.nodeType === Node.CDATA_SECTION_NODE) {
      let cdataValue = node.nodeValue;
      if (opts.trimText) cdataValue = cdataValue.trim();
      return { [opts.cdataNodeName]: parseValue(cdataValue) };
    }

    if (node.nodeType === Node.DOCUMENT_NODE) {
      if (
        opts.removeXmlDeclaration &&
        node.firstChild?.nodeType === Node.PROCESSING_INSTRUCTION_NODE
      ) {
        return processNode(node.documentElement);
      }
      return processNode(node.documentElement);
    }

    // Handle element nodes
    if (node.nodeType === Node.ELEMENT_NODE) {
      const result = {};

      // Process attributes
      if (
        !opts.ignoreAttributes &&
        node.attributes &&
        node.attributes.length > 0
      ) {
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes[i];
          const attrName = opts.ignoreNamespaces
            ? attr.nodeName.replace(/^.*:/, "")
            : attr.nodeName;
          result[opts.attributePrefix + attrName] = parseValue(attr.nodeValue);
        }
      }

      // Process child nodes
      let childNodes = [];
      for (let i = 0; i < node.childNodes.length; i++) {
        const childNode = node.childNodes[i];
        // Skip empty text nodes if specified
        if (childNode.nodeType === Node.TEXT_NODE) {
          const text = opts.trimText
            ? childNode.nodeValue.trim()
            : childNode.nodeValue;
          if (text) {
            childNodes.push(childNode);
          } else if (!opts.removeEmptyNodes) {
            childNodes.push(childNode);
          }
        } else {
          childNodes.push(childNode);
        }
      }

      // Handle simple text node with no children
      if (
        childNodes.length === 1 &&
        childNodes[0].nodeType === Node.TEXT_NODE
      ) {
        const text = processNode(childNodes[0]);
        if (text !== null) {
          result[opts.textNodeName] = text;
        }
      }
      // Handle simple CDATA node with no other children
      else if (
        childNodes.length === 1 &&
        childNodes[0].nodeType === Node.CDATA_SECTION_NODE
      ) {
        const cdata = processNode(childNodes[0]);
        if (cdata !== null) {
          Object.assign(result, cdata); // This will be simplified later
        }
      } else if (childNodes.length > 0) {
        // Process all children and group by tag name
        let groupedChildren = {};

        for (let i = 0; i < childNodes.length; i++) {
          const childNode = childNodes[i];

          if (childNode.nodeType === Node.TEXT_NODE) {
            const text = processNode(childNode);
            if (text !== null) {
              if (!result[opts.textNodeName]) result[opts.textNodeName] = "";
              result[opts.textNodeName] += text;
            }
            continue;
          }

          if (childNode.nodeType === Node.CDATA_SECTION_NODE) {
            const cdata = processNode(childNode);
            if (cdata !== null) {
              result[opts.cdataNodeName] = cdata[opts.cdataNodeName];
            }
            continue;
          }

          // Skip comment nodes
          if (childNode.nodeType === Node.COMMENT_NODE) continue;

          // Get child node name, optionally removing namespace
          const childName = opts.ignoreNamespaces
            ? childNode.nodeName.replace(/^.*:/, "")
            : childNode.nodeName;

          const childValue = processNode(childNode);

          // Process child value (simplify if it's a text-only or CDATA-only node)
          const processedValue = simplifyResult(childValue);

          if (groupedChildren[childName]) {
            // Convert to array if needed
            if (!Array.isArray(groupedChildren[childName])) {
              groupedChildren[childName] = [groupedChildren[childName]];
            }
            groupedChildren[childName].push(processedValue);
          } else {
            groupedChildren[childName] = processedValue;
          }
        }

        // Add all child nodes to result
        Object.assign(result, groupedChildren);
      }

      if (
        Object.keys(result).length === 0 ||
        (Object.keys(result).length === 1 && result[opts.textNodeName] === "")
      ) {
        if (opts.removeEmptyNodes) return null;
      }

      // Simplify the result if it's just a text or CDATA node
      return simplifyResult(result);
    }

    return null;
  };

  // Start processing from the root
  return processNode(xml);
}

export default xmlToJson;
