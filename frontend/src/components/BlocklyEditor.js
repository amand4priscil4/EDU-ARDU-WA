import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
// Importe o módulo javascript separadamente
import 'blockly/javascript';
// Importe o gerador de JavaScript corretamente 
import { javascriptGenerator } from 'blockly/javascript';

const BlocklyEditor = ({ onCodeChange }) => {
  const blocklyDiv = useRef(null);
  const toolbox = useRef(null);
  const workspaceRef = useRef(null);

  useEffect(() => {
    if (blocklyDiv.current && toolbox.current) {
      // Configuração básica do Blockly
      workspaceRef.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolbox.current,
        scrollbars: true,
        trashcan: true,
        grid: {
          spacing: 20,
          length: 3,
          colour: '#ccc',
          snap: true
        },
      });

      // Atualizar o código quando o workspace mudar
      workspaceRef.current.addChangeListener(() => {
        // Use BlocklyJS em vez de Blockly.JavaScript
        const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
        if (onCodeChange) {
          onCodeChange(code);
        }
      });

      // Redimensionar quando a janela for redimensionada
      const onResize = () => {
        Blockly.svgResize(workspaceRef.current);
      };

      window.addEventListener('resize', onResize);
      onResize();

      return () => {
        window.removeEventListener('resize', onResize);
        workspaceRef.current?.dispose();
      };
    }
  }, [onCodeChange]);

  return (
    <div>
      <div ref={blocklyDiv} style={{ height: '500px', width: '100%' }} />
      <xml 
        ref={toolbox} 
        style={{ display: 'none' }}
      >
        {/* Começaremos com blocos básicos do Blockly */}
        <category name="Lógica" colour="#5C81A6">
          <block type="controls_if"></block>
          <block type="logic_compare"></block>
          <block type="logic_operation"></block>
        </category>
        <category name="Loops" colour="#5CA65C">
          <block type="controls_repeat_ext"></block>
          <block type="controls_whileUntil"></block>
        </category>
      </xml>
    </div>
  );
};

export default BlocklyEditor;