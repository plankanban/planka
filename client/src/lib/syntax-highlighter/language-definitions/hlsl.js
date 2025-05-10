/*
 * This file derives from https://github.com/highlightjs/highlightjs-hlsl
 * Licensed under the MIT License:
 *
 * Copyright (c) 2021 Stef Levesque (@stef-levesque)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*
Language: HLSL
Description: High-level shader language
Author: Stef Levesque
Website: https://docs.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl
Category: graphics
*/

const HLSL_NUMBER_RE =
  '(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?([hHfFlL]?)|\\.\\d+)([eE][-+]?\\d+)?([hHfFlL]?))'; // 0x..., 0..., decimal, float, half, double

const HLSL_NUMBER_MODE = {
  className: 'number',
  begin: HLSL_NUMBER_RE,
  relevance: 0,
};

export default (hljs) => {
  const matrixBases =
    // eslint-disable-next-line no-useless-concat
    'bool double float half int uint ' + 'min16float min10float min16int min12int min16uint';

  const matrixSuffixes = [
    '',
    '1',
    '2',
    '3',
    '4',
    '1x1',
    '1x2',
    '1x3',
    '1x4',
    '2x1',
    '2x2',
    '2x3',
    '2x4',
    '3x1',
    '3x2',
    '3x3',
    '3x4',
    '4x1',
    '4x2',
    '4x3',
    '4x4',
  ];

  const matrixTypes = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const base of matrixBases.split(' ')) {
    // eslint-disable-next-line no-restricted-syntax
    for (const suffix of matrixSuffixes) {
      matrixTypes.push(base + suffix);
    }
  }

  const semanticsSV =
    'SV_Coverage SV_Depth SV_DispatchThreadID SV_DomainLocation ' +
    'SV_GroupID SV_GroupIndex SV_GroupThreadID SV_GSInstanceID SV_InnerCoverage SV_InsideTessFactor ' +
    'SV_InstanceID SV_IsFrontFace SV_OutputControlPointID SV_Position SV_PrimitiveID ' +
    'SV_RenderTargetArrayIndex SV_SampleIndex SV_StencilRef SV_TessFactor SV_VertexID ' +
    'SV_ViewportArrayIndex, SV_ShadingRate';

  const semanticsNum =
    'BINORMAL BLENDINDICES BLENDWEIGHT COLOR NORMAL POSITION PSIZE TANGENT TEXCOORD TESSFACTOR DEPTH ' +
    'SV_ClipDistance SV_CullDistance SV_DepthGreaterEqual SV_DepthLessEqual SV_Target ' +
    'SV_CLIPDISTANCE SV_CULLDISTANCE SV_DEPTHGREATEREQUAL SV_DEPTHLESSEQUAL SV_TARGET';

  const semanticsTypes = semanticsNum.split(' ');
  // eslint-disable-next-line no-restricted-syntax
  for (const s of semanticsNum.split(' ')) {
    // eslint-disable-next-line no-restricted-syntax
    for (const n of Array(16).keys()) {
      semanticsTypes.push(s + n.toString());
    }
  }

  return {
    name: 'HLSL',
    keywords: {
      keyword:
        'AppendStructuredBuffer asm asm_fragment BlendState break Buffer ByteAddressBuffer case ' +
        'cbuffer centroid class column_major compile compile_fragment CompileShader const continue ' +
        'ComputeShader ConsumeStructuredBuffer default DepthStencilState DepthStencilView discard do ' +
        'DomainShader dword else export extern false for fxgroup GeometryShader groupshared ' +
        'Hullshader if in inline inout InputPatch interface line lineadj linear LineStream ' +
        'matrix namespace nointerpolation noperspective ' +
        'NULL out OutputPatch packoffset pass pixelfragment PixelShader point PointStream precise ' +
        'RasterizerState RenderTargetView return register row_major RWBuffer RWByteAddressBuffer ' +
        'RWStructuredBuffer RWTexture1D RWTexture1DArray RWTexture2D RWTexture2DArray RWTexture3D sample ' +
        'sampler SamplerState SamplerComparisonState shared snorm stateblock stateblock_state static string ' +
        'struct switch StructuredBuffer tbuffer technique technique10 technique11 texture Texture1D ' +
        'Texture1DArray Texture2D Texture2DArray Texture2DMS Texture2DMSArray Texture3D TextureCube ' +
        'TextureCubeArray true typedef triangle triangleadj TriangleStream uint uniform unorm unsigned ' +
        'vector vertexfragment VertexShader void volatile while',

      type:
        // Data Types
        `${matrixTypes.join(' ')} ` +
        `Buffer vector matrix sampler SamplerState PixelShader VertexShader ` +
        `texture Texture1D Texture1DArray Texture2D Texture2DArray Texture2DMS Texture2DMSArray Texture3D ` +
        `TextureCube TextureCubeArray struct typedef`,

      built_in:
        // Semantics
        `POSITIONT FOG PSIZE VFACE VPOS ${semanticsTypes.join(
          ' ',
        )} ${semanticsSV} ${semanticsSV.toUpperCase()} ` +
        // Functions
        `abort abs acos all AllMemoryBarrier AllMemoryBarrierWithGroupSync any asdouble asfloat asin asint asuint ` +
        `atan atan2 ceil CheckAccessFullyMapped clamp clip cos cosh countbits cross D3DCOLORtoUBYTE4 ddx ddx_coarse ` +
        `ddx_fine ddy ddy_coarse ddy_fine degrees determinant DeviceMemoryBarrier DeviceMemoryBarrierWithGroupSync ` +
        `distance dot dst errorf EvaluateAttributeAtCentroid EvaluateAttributeAtSample EvaluateAttributeSnapped ` +
        `exp exp2 f16tof32 f32tof16 faceforward firstbithigh firstbitlow floor fma fmod frac frexp fwidth ` +
        `GetRenderTargetSampleCount GetRenderTargetSamplePosition GroupMemoryBarrier GroupMemoryBarrierWithGroupSync ` +
        `InterlockedAdd InterlockedAnd InterlockedCompareExchange InterlockedCompareStore InterlockedExchange ` +
        `InterlockedMax InterlockedMin InterlockedOr InterlockedXor isfinite isinf isnan ldexp length lerp lit log ` +
        `log10 log2 mad max min modf msad4 mul noise normalize pow printf Process2DQuadTessFactorsAvg ` +
        `Process2DQuadTessFactorsMax Process2DQuadTessFactorsMin ProcessIsolineTessFactors ProcessQuadTessFactorsAvg ` +
        `ProcessQuadTessFactorsMax ProcessQuadTessFactorsMin ProcessTriTessFactorsAvg ProcessTriTessFactorsMax ` +
        `ProcessTriTessFactorsMin radians rcp reflect refract reversebits round rsqrt saturate sign sin sincos sinh ` +
        `smoothstep sqrt step tan tanh tex1D tex1Dbias tex1Dgrad tex1Dlod tex1Dproj tex2D tex2Dbias tex2Dgrad ` +
        `tex2Dlod tex2Dproj tex3D tex3Dbias tex3Dgrad tex3Dlod tex3Dproj texCUBE texCUBEbias texCUBEgrad texCUBElod ` +
        `texCUBEproj transpose trunc`,

      literal: 'true false',
    },
    illegal: '"',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      HLSL_NUMBER_MODE,
      {
        className: 'meta',
        begin: '#',
        end: '$',
      },
    ],
  };
};
